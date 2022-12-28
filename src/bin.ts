import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
import {
  runAngleBracketCodemodForFiles,
  runEs5GetterCodemod,
  runNativeClassCodemod,
  runNoImplicitThisForFiles,
} from './steps/codemods';
import getPodDirectoryInformation from './steps/get-pod-directory-information';
import { promptPodFiles } from './steps/prompt-pod-files';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

async function main() {
  console.clear();

  const directoryInformation = await getPodDirectoryInformation();

  await promptPodFiles(directoryInformation);

  await runAngleBracketCodemodForFiles(directoryInformation);
  await runNoImplicitThisForFiles(directoryInformation);
  await runNativeClassCodemod(directoryInformation);
  await runEs5GetterCodemod(directoryInformation);
}

main();
