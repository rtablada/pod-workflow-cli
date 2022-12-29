import ComponentUsedInfo from '../models/component-used-info';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getLinesToFillScreen } from '../utils';

export async function promptForComponentsToUpgrade(componentsUsed: ComponentUsedInfo[]): Promise<ComponentUsedInfo[]> {
  console.log(`Found ${componentsUsed.length} Components used in current working pod.`);
  const result = await inquirer.prompt<{ components: ComponentUsedInfo[] }>({
    message: 'Choose which components to upgrade',
    name: 'components',
    type: 'checkbox',
    choices: componentsUsed.map((c) => ({
      name: `${chalk.blue.bold(c.prettyComponentName)} - ${chalk.italic.white(
        `Used ${chalk.green.bold(c.usesInCurrentPaths.length)} times in current pod, and ${chalk.red.bold(
          c.usesInOtherPaths.length
        )} in other files`
      )}`,
      value: c,
    })),
    pageSize: getLinesToFillScreen(),
  });

  return result.components;
}
