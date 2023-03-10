import { flatten } from 'lodash';
import { findComponentsUsedInPaths } from './ember-tools/component-info';
import { getCurrentSha, promptCommitChanges } from './git-utils';
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
import { getComponentInfo } from './ember-tools/component-info';
import getPodDirectoryInformation from './steps/get-pod-directory-information';
import { promptPodFiles } from './steps/prompt-pod-files';
import { UpgradeLog } from './info-logger/types';
import { randomUUID } from 'crypto';
import { updateUpgradeLog } from './info-logger/log-fs';

export async function upgradePod(args: UpgradePodArgs) {
  console.clear();

  const directoryInformation = await getPodDirectoryInformation(args);
  const componentInfo = getComponentInfo();

  await promptPodFiles(directoryInformation);

  const appContext = {
    directoryInformation,
    componentInfo,
  };

  const upgradeLog: UpgradeLog = {
    upgradeType: 'upgrade-pod',
    path: directoryInformation.podDirectoryPath,
    id: randomUUID(),
    componentsUpdated: [],
    remainingLintErrors: [],
    baseGitSha: await getCurrentSha(),
  };

  await upgradePaths({ appContext, paths: directoryInformation.podFileFullPaths, upgradeLog });
}

export async function upgradePaths({
  appContext,
  paths,
  commitMessageLines = [],
  promptBeforeMoreComponents = false,
  upgradeLog,
}: {
  appContext: AppContext;
  paths: string[];
  commitMessageLines?: string[];
  promptBeforeMoreComponents?: boolean;
  upgradeLog: UpgradeLog;
}) {
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

  await promptCommitChanges(
    appContext.directoryInformation,
    paths,
    'Edits for lint errors and failing tests',
    commitMessageLines
  );

  await updateUpgradeLog(upgradeLog);

  if (promptBeforeMoreComponents) {
    await promptContinue('Keep upgrading child components?');
  }

  const componentsUsed = findComponentsUsedInPaths(appContext.componentInfo, paths);

  if (componentsUsed.length === 0) {
    console.log('Upgrade Complete! There are no child components found!');

    process.exit(0);
  }

  const components = await promptForComponentsToUpgrade(componentsUsed);

  if (components.length === 0) {
    console.log('Upgrade Complete!');

    process.exit(0);
  }

  await upgradeComponents(appContext, components, upgradeLog);
}

async function upgradeComponents(appContext: AppContext, components: ComponentUsedInfo[], upgradeLog: UpgradeLog) {
  const componentPaths = flatten(components.map((c) => c.componentInfo.filePaths));

  upgradeLog.componentsUpdated = [
    ...upgradeLog.componentsUpdated,
    ...components.map((c) => ({ componentName: c.componentInfo.key })),
  ];

  const commitMessageLines = components.map((c) => `Upgrading: ${c.prettyComponentName}`);

  await upgradePaths({
    appContext,
    paths: componentPaths,
    commitMessageLines,
    promptBeforeMoreComponents: true,
    upgradeLog,
  });
}
