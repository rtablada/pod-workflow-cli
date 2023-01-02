import { flatten } from 'lodash';
import { findComponentsUsedInPaths } from './ember-tools/component-info';
import { promptCommitChanges } from './git-utils';
import ComponentUsedInfo from './models/component-used-info';
import {
  runAngleBracketCodemodForFiles,
  runNoImplicitThisForFiles,
  runNativeClassCodemod,
  runEs5GetterCodemod,
} from './steps/codemods';
import { promptForComponentsToUpgrade } from './steps/component-upgrade';
import { templateLintFix, esLintFix, templateLint, runEsLint } from './steps/lint-fix';
import { removeTemplateLintIgnore, removeJsLintIgnore } from './steps/lint-ignore';
import { AppContext, UpgradePodArgs } from './types';
import { promptContinue, promptToRerun } from './utils/exec';

import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';

import { getComponentInfo } from './ember-tools/component-info';
import getPodDirectoryInformation from './steps/get-pod-directory-information';
import { promptPodFiles } from './steps/prompt-pod-files';

export async function upgradePod(args: UpgradePodArgs) {
  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);
  console.clear();

  const directoryInformation = await getPodDirectoryInformation(args);
  const componentInfo = getComponentInfo();

  await promptPodFiles(directoryInformation);

  const appContext = {
    directoryInformation,
    componentInfo,
  };

  await upgradePaths(appContext, directoryInformation.podFileFullPaths);
}

export async function upgradePaths(
  appContext: AppContext,
  paths: string[],
  commitMessageLines: string[] = [],
  promptBeforeMoreComponents = false
) {
  await runAngleBracketCodemodForFiles(paths);
  await runNoImplicitThisForFiles(paths);
  await runNativeClassCodemod(paths);
  await runEs5GetterCodemod(paths);

  await promptCommitChanges(appContext.directoryInformation, paths, 'Run Codemods', commitMessageLines);

  await removeTemplateLintIgnore(paths);
  await removeJsLintIgnore(paths);

  await promptCommitChanges(appContext.directoryInformation, paths, 'Remove Lint Ignore', commitMessageLines);

  await templateLintFix(paths);
  await esLintFix(paths);

  await promptCommitChanges(appContext.directoryInformation, paths, 'Fix Lint Errors', commitMessageLines);

  await promptToRerun('Automated fixes have been applied. Rerun Linters or Continue to Components?', async () => {
    console.clear();
    await templateLint(paths);
    await runEsLint(paths);
  });

  if (promptBeforeMoreComponents) {
    await promptContinue('Keep upgrading child components?');
  }

  const componentsUsed = findComponentsUsedInPaths(appContext.componentInfo, paths);

  if (componentsUsed.length === 0) {
    console.log('Upgrade Complete! There are no child components found!');

    process.exit(0);
  }

  const components = await promptForComponentsToUpgrade(componentsUsed);

  await upgradeComponents(appContext, components);
}

async function upgradeComponents(appContext: AppContext, components: ComponentUsedInfo[]) {
  const componentPaths = flatten(components.map((c) => c.componentInfo.filePaths));

  const commitMessageLines = components.map((c) => `Upgrading: ${c.prettyComponentName}`);

  await upgradePaths(appContext, componentPaths, commitMessageLines, true);
}
