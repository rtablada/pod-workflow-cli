import inquirer from 'inquirer';
import directoryTree, { DirectoryTree } from 'directory-tree';
import { getLinesToFillScreen, getAllFilePaths, relativePathToPodBase } from '../utils';

export interface DirectoryInformation {
  podDirectoryPath: string;
  podDirectoryFullPath: string;
  podDirectoryTree: DirectoryTree;
  podFilePaths: string[];
  podFileFullPaths: string[];
}

export default async function getPodDirectoryInformation(): Promise<DirectoryInformation> {
  const { podDirectory: podDirectoryFullPath }: { podDirectory: string } = await inquirer.prompt({
    name: 'podDirectory',
    type: 'file-tree-selection',
    message: 'Choose a pod directory (Up/Down to navigate, Right/Left to open/close directories)',
    onlyShowDir: true,
    hideRoot: true,
    root: './app/pods',
    pageSize: getLinesToFillScreen(),
  });

  const podDirectoryTree = directoryTree(podDirectoryFullPath, {
    exclude: /.DS_Store/i,
  });

  const podFileFullPaths = getAllFilePaths(podDirectoryTree);

  const podFilePaths = podFileFullPaths.map(relativePathToPodBase);
  const podDirectoryPath = relativePathToPodBase(podDirectoryFullPath);

  return { podDirectoryFullPath, podDirectoryPath, podDirectoryTree, podFilePaths: podFilePaths, podFileFullPaths };
}
