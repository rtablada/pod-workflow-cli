import inquirer from 'inquirer';
import { getLinesToFillScreen } from '../utils';

export async function promptPodFiles(podDirectoryPath: string, podFiles: string[]) {
  let confirmRun = null;

  while (confirmRun === null) {
    const result = await inquirer.prompt({
      name: 'confirmRun',
      type: 'expand',
      message: `Pod Workflow will Run on ${podFiles.length} files in "/${podDirectoryPath}": continue?`,
      default: 'continue',
      choices: [
        {
          key: 'y',
          name: 'Continue',
          value: 'continue',
        },
        {
          key: 'n',
          name: 'Exit',
          value: 'exit',
        },
        {
          key: 'v',
          name: 'View File List',
          value: 'details',
        },
      ],
    });

    confirmRun = result.confirmRun;

    if (confirmRun === 'exit') {
      process.exit(1);
    } else if (confirmRun === 'details') {
      await inquirer.prompt({
        message: 'List of files in current pod. Press enter to continue.',
        name: 'fileIgnore',
        type: 'rawlist',
        choices: podFiles,
        pageSize: getLinesToFillScreen(),
      });

      confirmRun = null;
    }
  }
}
