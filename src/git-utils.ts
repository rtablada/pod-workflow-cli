import { DirectoryInformation } from './steps/get-pod-directory-information';
import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import { promptContinue } from './input-utils';

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

    const { gitCommit } = await inquirer.prompt({
      name: 'gitCommit',
      type: 'confirm',
      message: `Commit changes for step: ${message}`,
    });

    if (gitCommit) {
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

export async function filesChangedSince(gitSha: string, path?: string): Promise<string[]> {
  const diff = await gitClient.diffSummary(path ? [gitSha, path] : [gitSha]);

  return diff.files.map((f) => f.file);
}
