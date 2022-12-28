import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
import getPodDirectoryInformation from './steps/get-pod-directory-information';
import { promptPodFiles } from './steps/prompt-pod-files';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

async function main() {
  console.clear();

  const { podDirectoryPath, podFiles } = await getPodDirectoryInformation();

  await promptPodFiles(podDirectoryPath, podFiles);
}

main();
