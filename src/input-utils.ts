import inquirer from 'inquirer';

export const promptContinue = async (message = 'Continue?') => {
  let confirm = null;

  while (confirm === null) {
    const result = await inquirer.prompt({
      name: 'confirm',
      type: 'expand',
      message: message,
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
          key: 'w',
          name: 'Wait',
          value: null,
        },
      ],
    });

    confirm = result.confirm;

    if (confirm === 'exit') {
      process.exit(0);
    }
  }
};
