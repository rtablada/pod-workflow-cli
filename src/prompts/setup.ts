import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';

export function setupInquirer() {
  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);
}
