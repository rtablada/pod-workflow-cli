import { readFile } from 'fs/promises';
import _ from 'lodash';
import path from 'path';
import inquirer from 'inquirer';
import pathExists from 'path-exists';
import { ESLINT_DISABLE, TEMPLATE_LINT_DISABLE } from './consts';
import { filesChangedSince, getRepoRootPath } from './git-utils';
import { readLogs } from './info-logger/log-fs';
import { ComponentUpgradeLog, LintRemainingLog, UpgradeLog } from './info-logger/types';
import { PrDescriptionArgs } from './types';
import { angleBracketify, relativePathToProjectBase } from './utils';

export async function generatePrBody(config: PrDescriptionArgs) {
  const upgradeLogs = await readLogs();

  if (upgradeLogs.length === 0) {
    console.log('No upgrade logs found. Cannot create Pull Request info...');
    return;
  } else {
    const selectedUpgradeLogs = config.latest
      ? [upgradeLogs[upgradeLogs.length - 1]]
      : await promptUpgradeLogs(upgradeLogs);

    return `
# Pods Updated

${podList(selectedUpgradeLogs, config)}

# Components Updated

${componentsList(selectedUpgradeLogs, config)}

# Tests Updated

${await getTestsUpdated(selectedUpgradeLogs, config)}

# Remaining Lint Errors

${await getLintIgnoresInChangedFiles(selectedUpgradeLogs, config)}`;
  }
}

function podList(upgradeLogs: UpgradeLog[], config: PrDescriptionArgs) {
  const uniquePaths = _.uniqBy(upgradeLogs, (a) => a.path);

  if (uniquePaths.length === 0) {
    return 'None';
  }

  return uniquePaths
    .map((upgradeLog) => {
      const podPath = `${config.baseDir}/${upgradeLog.path}`;

      return `* [${podPath}](${config.podDashboardUrl}/pod-info?path=${podPath})`;
    })
    .join('\n');
}

function componentListItem(componentUpgradeLog: ComponentUpgradeLog, config: PrDescriptionArgs) {
  return `* [${angleBracketify(componentUpgradeLog.componentName)}](${config.podDashboardUrl}/components?path=${
    componentUpgradeLog.componentName
  })`;
}

function componentsList(upgradeLogs: UpgradeLog[], config: PrDescriptionArgs) {
  const componentsUpdated = _.chain(upgradeLogs)
    .map((a) => a.componentsUpdated)
    .flatten()
    .uniq()
    .value();

  if (componentsUpdated.length === 0) {
    return 'None';
  }

  return componentsUpdated.map((c) => componentListItem(c, config)).join('\n');
}

async function getTestsUpdated(upgradeLogs: UpgradeLog[], config: PrDescriptionArgs) {
  const allFilesChanged = await Promise.all(
    upgradeLogs.map((upgradeLog) => filesChangedSince(upgradeLog.baseGitSha, 'tests'))
  );

  const filesChanged = _.chain(allFilesChanged).flatten().uniq().value();

  if (filesChanged.length === 0) {
    return 'None';
  }

  return filesChanged.map((a) => `* ${relativePathToProjectBase(a)}`).join('\n');
}

async function getLintIgnoresInChangedFiles(upgradeLogs: UpgradeLog[], config: PrDescriptionArgs) {
  const allFilesChanged = await Promise.all(upgradeLogs.map((upgradeLog) => filesChangedSince(upgradeLog.baseGitSha)));
  const filesChanged = _.chain(allFilesChanged).flatten().uniq().value();

  const remainingLintIgnores = (await Promise.all(filesChanged.map((a) => getLintIgnoresInChangedFile(a)))).filter(
    (a) => a
  );

  if (remainingLintIgnores.length === 0) {
    return 'None';
  }

  return remainingLintIgnores
    .map((lintRemainingLog) => {
      return `* ${lintRemainingLog.path}
${lintRemainingLog.lintErrors.map((err) => `  * ${err}`).join('\n')}`;
    })
    .join('\n');
}

function getLintIgnoresInChangedFile(filePath: string): Promise<LintRemainingLog> {
  if (path.extname(filePath) === '.js') {
    return getJsIgnores(filePath);
  } else if (path.extname(filePath) === '.hbs') {
    return getHbsIgnores(filePath);
  }
}

async function getJsIgnores(filePath: string): Promise<LintRemainingLog> {
  if (!(await pathExists(filePath))) {
    return undefined;
  }

  const fileContents = await readFile(filePath, { encoding: 'utf-8' });

  const match = fileContents.match(ESLINT_DISABLE);

  if (match) {
    const rulesIgnored = match.groups.lintRules.trim().split(/\s+/);
    return { path: relativePathToProjectBase(filePath), lintErrors: rulesIgnored };
  }

  return undefined;
}

async function getHbsIgnores(filePath: string): Promise<LintRemainingLog> {
  if (!(await pathExists(filePath))) {
    return undefined;
  }

  const fileContents = await readFile(filePath, { encoding: 'utf-8' });

  const match = fileContents.match(TEMPLATE_LINT_DISABLE);

  if (match) {
    const rulesIgnored = match.groups.lintRules.trim().split(/\s+/);
    return { path: relativePathToProjectBase(filePath), lintErrors: rulesIgnored };
  }

  return undefined;
}

async function promptUpgradeLogs(upgradeLogs: UpgradeLog[]): Promise<UpgradeLog[]> {
  const result = await inquirer.prompt({
    message: 'What pods would you like to create a PR for?',
    name: 'selectedLogs',
    type: 'checkbox',
    choices: upgradeLogs.map((upgradeLog) => ({
      name: upgradeLog.path,
      value: upgradeLog,
    })),
  });

  return result.selectedLogs;
}
