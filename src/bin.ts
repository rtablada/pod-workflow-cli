/* eslint-disable @typescript-eslint/no-var-requires */
import { Command, Option } from 'commander';
import path from 'path';
import { generatePrBody } from './pr-description';
import { upgradePod } from './upgrade';
import { PrDescriptionArgs } from './types';
import clipboard from 'clipboardy';
import { setupInquirer } from './prompts/setup';
import { getFilesFromInput, requestPaths } from './prompts/request-paths';
import {
  runAngleBracketCodemodForFiles,
  runNoImplicitThisForFiles,
  runNativeClassCodemod,
  runEs5GetterCodemod,
} from './steps/codemods';
import { fullPath, getAllFilePaths } from './utils';
import { templateLintFix, esLintFix } from './steps/lint-fix';
import { removeTemplateLintIgnore, removeJsLintIgnore } from './steps/lint-ignore';
import directoryTree from 'directory-tree';
import _ from 'lodash';
const program = new Command();

program
  .name('pod-workflow')
  .description('A modern way to progressively update your code to the best practices using lint rules')
  .version(require(path.join(__dirname, '../', 'package.json')).version)
  .hook('preAction', () => {
    setupInquirer();
  });

program
  .command('run-codemods')
  .description('Runs all codemods for a given path.')
  .option('-p, --pod-dir <path>', 'Directory to run codemods on')
  .action(async (config) => {
    const files = await getFilesFromInput(config);

    await runAngleBracketCodemodForFiles(files);
    await runNoImplicitThisForFiles(files);
    await runNativeClassCodemod(files);
    await runEs5GetterCodemod(files);
    console.log('Codemods complete!');
  });

program
  .command('autofix')
  .description('Removes lint ignores and runs linters with fix option.')
  .option('-p, --pod-dir <path>', 'Directory to run codemods on')
  .action(async (config) => {
    const files = await getFilesFromInput(config);

    await removeTemplateLintIgnore(files);
    await removeJsLintIgnore(files);
    await templateLintFix(files);
    await esLintFix(files);
    console.log('Lint fix complete!');
  });

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
  .addOption(
    new Option('--pod-dashboard-url <url>', 'Base URL for pod-dashboard UI').env('POD_DASHBOARD').makeOptionMandatory()
  )
  .option('-b, --base-dir <path>', 'parent pod directory', 'app/pods')
  .option('-l, --latest', 'Create PR Log for latest pod workflow (do not prompt for paths)')
  .option('--output-only', 'Print the PR body instead of copying to clipboard')
  .action(async (config: PrDescriptionArgs) => {
    const prBody = await generatePrBody(config);

    if (!prBody) {
      return;
    }

    if (config.outputOnly) {
      console.log(prBody);
    } else {
      await clipboard.write(prBody);

      console.log('Pr Description copied to clipboard!');
    }
  });

program.parse();
