import inquirer from 'inquirer';
import directoryTree, { DirectoryTree } from 'directory-tree';
import { getLinesToFillScreen, getAllFilePaths, relativePathToPodBase, fullPathFromPod } from '../utils';
import { UpgradePodArgs } from '../types';
import path from 'path';

export interface DirectoryInformation {
  podDirectoryPath: string;
  podDirectoryFullPath: string;
  podDirectoryTree: DirectoryTree;
  podFilePaths: string[];
  podFileFullPaths: string[];
}

export default async function getPodDirectoryInformation(args: UpgradePodArgs): Promise<DirectoryInformation> {
  let podDirectoryFullPath;

  if (args.podDirectory !== undefined) {
    podDirectoryFullPath = path.isAbsolute(args.podDirectory)
      ? args.podDirectory
      : fullPathFromPod(args.podDirectory, args);
  } else {
    const result: { podDirectory: string } = await inquirer.prompt({
      name: 'podDirectory',
      type: 'file-tree-selection',
      message: 'Choose a pod directory (Up/Down to navigate, Right/Left to open/close directories)',
      onlyShowDir: true,
      hideRoot: true,
      root: args.baseDirectory,
      pageSize: getLinesToFillScreen(),
    });
    podDirectoryFullPath = result.podDirectory;
  }

  const podDirectoryTree = directoryTree(podDirectoryFullPath, {
    exclude: /.DS_Store/i,
  });

  const podFileFullPaths = getAllFilePaths(podDirectoryTree);

  const podFilePaths = podFileFullPaths.map((p) => relativePathToPodBase(p, args));
  const podDirectoryPath = relativePathToPodBase(podDirectoryFullPath, args);

  return { podDirectoryFullPath, podDirectoryPath, podDirectoryTree, podFilePaths: podFilePaths, podFileFullPaths };
}
