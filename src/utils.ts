import { DirectoryTree } from 'directory-tree';
import { camelCase, flatten, toUpper } from 'lodash';
import path from 'path';
import { UpgradePodArgs } from './types';

export const relativePathToProjectBase = (filePath: string) => {
  return path.relative(path.join(process.cwd()), filePath);
};

export const relativePathToPodBase = (filePath: string, args: UpgradePodArgs) => {
  return path.relative(path.join(process.cwd(), args.baseDirectory), filePath);
};

export const fullPathFromPod = (filePath: string, args: UpgradePodArgs) => {
  return path.join(process.cwd(), args.baseDirectory, filePath);
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

export const pascalCase = (str) => camelCase(str).replace(/^(.)/, toUpper);

export const angleBracketify = (str: string) => `${str.split('/').map(pascalCase).join('::')}`;
