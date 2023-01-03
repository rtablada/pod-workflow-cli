import { getFilesByExtension } from '../utils';
import { runCommand } from '../utils/exec';

export async function templateLint(filePaths: string[]) {
  const files = getFilesByExtension(filePaths, '.hbs');

  try {
    await runCommand(`ember-template-lint ${files.join(' ')}`);
  } catch {}
}

export async function runEsLint(filePaths: string[]) {
  const files = getFilesByExtension(filePaths, '.js');

  try {
    await runCommand(`eslint ${files.join(' ')}`);
  } catch {}
}

export async function templateLintFix(filePaths: string[]) {
  const files = getFilesByExtension(filePaths, '.hbs');

  if (files.length === 0) {
    console.log('No matching files found, skipping Ember Template Lint');
    return;
  }

  console.log(`Running Ember Template Lint for ${files.length} files...`);

  try {
    await runCommand(`ember-template-lint --fix ${files.join(' ')}`);
  } catch {}

  console.log(`Finished Running Ember Template Lint`);
}

export async function esLintFix(filePaths: string[]) {
  const files = getFilesByExtension(filePaths, '.js');

  if (files.length === 0) {
    console.log('No matching files found, skipping ESLint');
    return;
  }

  console.log(`Running ESLint for ${files.length} files...`);

  try {
    await runCommand(`eslint --fix ${files.join(' ')}`);
  } catch {}

  console.log(`Finished Running ESLint`);
}
