import { DirectoryInformation } from './steps/get-pod-directory-information';
import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { promptContinue } from './input-utils';
import path from 'path';
import { confirm } from './prompts/confirm';

const gitClient = simpleGit();

export async function getCurrentSha() {
  return await gitClient.revparse('HEAD');
}

export async function promptCommitChanges(
  directoryInformation: DirectoryInformation,
  paths: string[],
  message: string,
  otherMessages: string[] = []
): Promise<void> {
  if (await hasChanges()) {
    await gitClient.add(paths);

    if (await confirm(`Commit changes for step: ${message}`)) {
      const commitResult = await gitClient.commit([
        `Pod Workflow 🤖 for "${directoryInformation.podDirectoryPath}: ${message}"`,
        ...otherMessages,
      ]);
    } else {
      await promptContinue();
    }
  } else {
    console.log(`Skipping commit for "${message}: there were no changes detected`);
  }
}

export async function hasChanges(): Promise<boolean> {
  const status = await gitClient.status();

  return !status.isClean();
}

export async function filesChangedSince(gitSha: string, filePath?: string): Promise<string[]> {
  const root = await getRepoRootPath();
  const diff = await gitClient.diffSummary(filePath ? [gitSha, filePath] : [gitSha]);

  return diff.files.map((f) => path.join(root, f.file));
}

export async function getRepoRootPath() {
  return await gitClient.revparse('--show-toplevel');
}
