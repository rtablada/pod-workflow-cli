/* eslint-disable @typescript-eslint/no-var-requires */
import { Command, Option } from 'commander';
import path from 'path';
import { generatePrBody } from './pr-description';
import { upgradePod } from './upgrade';
import { PrDescriptionArgs } from './types';
import clipboard from 'clipboardy';
const program = new Command();

program
  .name('pod-workflow')
  .description('A modern way to progressively update your code to the best practices using lint rules')
  .version(require(path.join(__dirname, '../', 'package.json')).version);

program
  .command('upgrade-pod')
  .description('Upgrades a given pod path with codemods, linting, LTTF, and more.')
  .option('-b, --base-dir <path>', 'parent pod directory', 'app/pods')
  .option(
    '-p, --pod-dir <path>',
    'Directory for pod to be upgraded relative to base dir: skips file tree prompt',
    undefined
  )
  .action(async (config) => {
    await upgradePod({ baseDirectory: config.baseDir, podDirectory: config.podDir });
  });

program
  .command('pr-description')
  .description('Copies description of latest upgrade log to clipboard for PR Descriptions')
  .addOption(new Option('-p, --pod-dashboard-url <url>', 'Base URL for pod-dashboard UI').env('POD_DASHBOARD'))
  .option('-b, --base-dir <path>', 'parent pod directory', 'app/pods')
  .option('--output-only', 'Print the PR body instead of copying to clipboard')
  .action(async (config: PrDescriptionArgs) => {
    const prBody = await generatePrBody(config);

    if (config.outputOnly) {
      console.log(prBody);
    } else {
      await clipboard.write(prBody);

      console.log('Pr Description copied to clipboard!');
    }
  });

program.parse();
