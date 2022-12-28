import inquirer from 'inquirer';
import directoryTree, { DirectoryTree } from 'directory-tree';
import { getLinesToFillScreen, getAllFilePaths, relativePathToPodBase } from '../utils';

export default async function getPodDirectoryInformation(): Promise<{
  podDirectoryPath: string;
  podDirectoryFullPath: string;
  podDirectoryTree: DirectoryTree;
  podFiles: string[];
}> {
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

  const podFiles = getAllFilePaths(podDirectoryTree).map(relativePathToPodBase);
  const podDirectoryPath = relativePathToPodBase(podDirectoryFullPath);

  return { podDirectoryFullPath, podDirectoryPath, podDirectoryTree, podFiles };
}
