import { DirectoryInformation } from './get-pod-directory-information';
import { exec } from 'child_process';
import { getFilesByExtension } from '../utils';

const runCommand = (cmd) =>
  new Promise((resolve, reject) => {
    const script = exec(cmd);
    script.stdout.on('data', console.log);
    script.on('exit', (code) => {
      if (code === 1) {
        return reject();
      }

      resolve(null);
    });
  });

export async function runAngleBracketCodemodForFiles(directoryInformation: DirectoryInformation) {
  const files = getFilesByExtension(directoryInformation.podFileFullPaths, '.hbs');
  console.clear();

  console.log(`Running Angle Bracket Codemod for ${files.length} files...`);
  await runCommand(`ember-angle-brackets-codemod ${files.join(' ')}`);

  console.log(`Finished Running Angle Bracket Codemod`);
}

export async function runNoImplicitThisForFiles(directoryInformation: DirectoryInformation) {
  const files = getFilesByExtension(directoryInformation.podFileFullPaths, '.hbs');
  console.clear();

  console.log(`Running No Implicit This Codemod for ${files.length} files...`);
  await runCommand(`ember-no-implicit-this-codemod http://localhost:4200/login ${files.join(' ')}`);

  console.log(`Finished Running No Implicit This Codemod`);
}

export async function runEs5GetterCodemod(directoryInformation: DirectoryInformation) {
  const files = getFilesByExtension(directoryInformation.podFileFullPaths, '.js');
  console.clear();

  console.log(`Running ES5 Getter Codemod for ${files.length} files...`);
  await runCommand(`npx github:ember-codemods/es5-getter-ember-codemod es5-getter-ember-codemod ${files.join(' ')}`);

  console.log(`Finished Running ES5 Getter Codemod`);
}

export async function runNativeClassCodemod(directoryInformation: DirectoryInformation) {
  const files = getFilesByExtension(directoryInformation.podFileFullPaths, '.js');
  console.clear();

  console.log(`Running Native Class Codemod for ${files.length} files...`);
  await runCommand(`ember-native-class-codemod http://localhost:4200 ${files.join(' ')} --classic-decorator=false`);

  console.log(`Finished Running Native Class Codemod`);
}
