import { fullPath, getAllFilePaths, getLinesToFillScreen } from '../utils';
import inquirer from 'inquirer';
import { stat } from 'fs/promises';
import path from 'path';
import directoryTree from 'directory-tree';
import _ from 'lodash';

export async function getFilesFromInput(config: { podDir: string }): Promise<string[]> {
  const paths = config.podDir ? [fullPath(config.podDir)] : await requestPaths();

  return _.chain(
    paths.map((path) => {
      const podDirectoryTree = directoryTree(path, {
        exclude: /.DS_Store/i,
      });

      return getAllFilePaths(podDirectoryTree);
    })
  )
    .flatten()
    .uniq()
    .value();
}

export async function requestPaths(root: string = undefined) {
  console.clear();
  const result: { podDirectory: string[] } = await inquirer.prompt({
    name: 'podDirectory',
    type: 'file-tree-selection',
    message: 'Choose a directory (Up/Down to navigate, Right/Left to open/close directories, Space to select)',
    hideRoot: true,
    multiple: true,
    root,
    pageSize: getLinesToFillScreen(),
    onlyShowValid: true,
    async validate(dir) {
      const stats = await stat(dir);

      return stats.isDirectory() || path.extname(dir) === '.js' || path.extname(dir) === '.hbs';
    },
  });

  return result.podDirectory;
}
