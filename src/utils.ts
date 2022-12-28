import { DirectoryTree } from 'directory-tree';
import { flatten } from 'lodash';
import path from 'path';

export const relativePathToPodBase = (filePath: string) => {
  return path.relative(path.join(process.cwd(), 'app/pods'), filePath);
};

export const getAllFilePaths = (podDirectoryTree: DirectoryTree): string[] => {
  if (podDirectoryTree.children) {
    return flatten([...podDirectoryTree.children.map(getAllFilePaths)]);
  }

  return [podDirectoryTree.path];
};

export const getLinesToFillScreen = () => process.stdout.getWindowSize()[1] - 5;

export function getFilesByExtension(paths: string[], extension: string): string[] {
  return paths.filter((p) => p.match(new RegExp(`${extension}$`)));
}
