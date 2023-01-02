import { readFile } from 'fs/promises';
import path from 'path';
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
    const latestUpgradeLog = upgradeLogs[0];

    return `
# Pods Updated

${podList(latestUpgradeLog, config)}

# Components Updated

${componentsList(latestUpgradeLog, config)}

# Tests Updated

${await getTestsUpdated(latestUpgradeLog, config)}

# Remaining Lint Errors

${await getLintIgnoresInChangedFiles(latestUpgradeLog, config)}`;
  }
}

function podList(latestUpgradeLog: UpgradeLog, config: PrDescriptionArgs) {
  if (latestUpgradeLog.path) {
    const podPath = `${config.baseDir}/${latestUpgradeLog.path}`;

    return `* [${podPath}](${config.podDashboardUrl}/pod-info?path=${podPath})`;
  }
  return 'None';
}

function componentListItem(componentUpgradeLog: ComponentUpgradeLog, config: PrDescriptionArgs) {
  return `* [${angleBracketify(componentUpgradeLog.componentName)}](${config.podDashboardUrl}/components?path=${
    componentUpgradeLog.componentName
  })`;
}

function componentsList(latestUpgradeLog: UpgradeLog, config: PrDescriptionArgs) {
  if (latestUpgradeLog.componentsUpdated.length === 0) {
    return 'None';
  }

  return latestUpgradeLog.componentsUpdated.map((c) => componentListItem(c, config)).join('\n');
}

async function getTestsUpdated(latestUpgradeLog: UpgradeLog, config: PrDescriptionArgs) {
  const filesChanged = await filesChangedSince(latestUpgradeLog.baseGitSha, 'tests');

  if (filesChanged.length === 0) {
    return 'None';
  }

  return filesChanged.map((a) => `* ${relativePathToProjectBase(a)}`).join('\n');
}

async function getLintIgnoresInChangedFiles(latestUpgradeLog: UpgradeLog, config: PrDescriptionArgs) {
  const filesChanged = await filesChangedSince(latestUpgradeLog.baseGitSha);

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
