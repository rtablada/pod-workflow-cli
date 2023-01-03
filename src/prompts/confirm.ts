import inquirer from 'inquirer';

export async function confirm(message: string): Promise<boolean> {
  const { value } = await inquirer.prompt({
    name: 'value',
    type: 'confirm',
    message: message,
  });

  return value;
}
