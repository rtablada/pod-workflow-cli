import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
import { promptCommitChanges } from './git-utils';
import {
  runAngleBracketCodemodForFiles,
  runEs5GetterCodemod,
  runNativeClassCodemod,
  runNoImplicitThisForFiles,
} from './steps/codemods';
import getPodDirectoryInformation from './steps/get-pod-directory-information';
import { esLintFix, templateLintFix } from './steps/lint-fix';
import { removeJsLintIgnore, removeTemplateLintIgnore } from './steps/lint-ignore';
import { promptPodFiles } from './steps/prompt-pod-files';
import { directoryInformation } from './test-data';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

async function main() {
  console.clear();

  // const directoryInformation = await getPodDirectoryInformation();

  await promptPodFiles(directoryInformation);

  await runAngleBracketCodemodForFiles(directoryInformation);
  await runNoImplicitThisForFiles(directoryInformation);
  await runNativeClassCodemod(directoryInformation);
  await runEs5GetterCodemod(directoryInformation);

  await promptCommitChanges(directoryInformation, 'Run Codemods');

  await removeTemplateLintIgnore(directoryInformation.podFileFullPaths);
  await removeJsLintIgnore(directoryInformation.podFileFullPaths);

  await promptCommitChanges(directoryInformation, 'Remove Lint Ignore');

  await templateLintFix(directoryInformation.podFileFullPaths);
  await esLintFix(directoryInformation.podFileFullPaths);

  await promptCommitChanges(directoryInformation, 'Fix Lint Errors');
}

main();
