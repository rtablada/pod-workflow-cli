import { readFile, writeFile } from 'fs/promises';
import { getFilesByExtension } from '../utils';

const TEMPLATE_LINT_DISABLE = /^{{!\s*template-lint-disable.*}}\n/;
const ESLINT_DISABLE = /^\/\*\s*eslint-disable.*\*\/\n/;

function removeLintFromAllFiles(filePaths: string[], regex: RegExp, lintType: string) {
  return Promise.all(filePaths.map((filePath) => removeLintFromFile(filePath, regex, lintType)));
}

async function removeLintFromFile(filePath: string, regex: RegExp, lintType: string) {
  const content = await readFile(filePath, { encoding: 'utf-8' });

  if (content.match(regex)) {
    await writeFile(filePath, content.replace(regex, ''), { encoding: 'utf-8' });
    console.log(`Removed ${lintType} ignore in ${filePath}`);
  }
}

export async function removeTemplateLintIgnore(filePaths: string[]): Promise<void> {
  const templateFiles = getFilesByExtension(filePaths, '.hbs');

  await removeLintFromAllFiles(templateFiles, TEMPLATE_LINT_DISABLE, 'template lint');
}

export async function removeJsLintIgnore(filePaths: string[]): Promise<void> {
  const templateFiles = getFilesByExtension(filePaths, '.js');

  await removeLintFromAllFiles(templateFiles, ESLINT_DISABLE, 'eslint');
}
