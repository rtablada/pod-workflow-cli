import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

async function main() {
  const { podDirectory }: { podDirectory: string } = await inquirer.prompt({
    name: 'podDirectory',
    type: 'file-tree-selection',
    message: 'Choose a pod directory (Up/Down to navigate, Right/Left to open/close directories)',
    onlyShowDir: true,
    hideRoot: true,
    root: './app/pods',
  });
}

main();
