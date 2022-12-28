import { getFilesByExtension } from '../utils';
import { runCommand } from '../utils/exec';

export async function templateLintFix(filePaths: string[]) {
  const files = getFilesByExtension(filePaths, '.hbs');

  console.log(`Running Ember Template Lint for ${files.length} files...`);

  try {
    await runCommand(`ember-template-lint --fix ${files.join(' ')}`);
  } catch {}

  console.log(`Finished Running Ember Template Lint`);
}

export async function esLintFix(filePaths: string[]) {
  const files = getFilesByExtension(filePaths, '.js');

  console.log(`Running ESLint for ${files.length} files...`);

  try {
    await runCommand(`eslint --fix ${files.join(' ')}`);
  } catch {}

  console.log(`Finished Running ESLint`);
}
