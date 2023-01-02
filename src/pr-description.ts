import { filesChangedSince } from './git-utils';
import { readLogs } from './info-logger/log-fs';
import { ComponentUpgradeLog, UpgradeLog } from './info-logger/types';
import { PrDescriptionArgs } from './types';
import { angleBracketify } from './utils';

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

None`;
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

  return filesChanged.map((a) => `* ${a}`).join('\n');
}
