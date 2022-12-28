import { exec } from 'child_process';
import inquirer from 'inquirer';

export const runCommand = (cmd) =>
  new Promise((resolve, reject) => {
    const script = exec(cmd);
    script.stdout.pipe(process.stdout);

    // script.stdout.on('data', console.log);
    script.on('exit', (code) => {
      if (code === 1) {
        return reject();
      }

      resolve(null);
    });
  });

export const promptToRerun = async (message: string, callback: () => Promise<void>): Promise<void> => {
  let confirm = null;

  while (confirm === null) {
    const result = await inquirer.prompt({
      name: 'confirm',
      type: 'expand',
      message: message,
      default: 'rerun',
      choices: [
        {
          key: 'y',
          name: 'Continue',
          value: 'continue',
        },
        {
          key: 'r',
          name: 'Rerun',
          value: 'rerun',
        },
      ],
    });

    confirm = result.confirm;

    if (confirm === 'rerun') {
      await callback();
      confirm = null;
    }
  }
};
