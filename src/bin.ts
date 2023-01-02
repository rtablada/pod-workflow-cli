/* eslint-disable @typescript-eslint/no-var-requires */
import { Command } from 'commander';
import path from 'path';
import { upgradePod } from './upgrade';

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

program.command('pr-description').action(async () => {
  console.error('not implemented');
});

program.parse();
