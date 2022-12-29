import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';

import { getComponentInfo } from './ember-tools/component-info';
import getPodDirectoryInformation from './steps/get-pod-directory-information';
import { promptPodFiles } from './steps/prompt-pod-files';
import { directoryInformation } from './test-data';
import { upgradePaths } from './upgrade';

async function main() {
  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);
  console.clear();

  // const directoryInformation = await getPodDirectoryInformation();
  const componentInfo = getComponentInfo();

  await promptPodFiles(directoryInformation);

  const appContext = {
    directoryInformation,
    componentInfo,
  };

  await upgradePaths(appContext, directoryInformation.podFileFullPaths);
}

main();
