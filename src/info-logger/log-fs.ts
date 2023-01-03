import { readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import pathExists from 'path-exists';
import { UpgradeLog } from './types';

export function getLogPath() {
  return path.join(process.cwd(), '.pod-workflow.log');
}

export async function readLogs(): Promise<UpgradeLog[]> {
  const logFilePath = getLogPath();

  if (await pathExists(logFilePath)) {
    const fileContents = await readFile(logFilePath, { encoding: 'utf-8' });

    return JSON.parse(fileContents) as UpgradeLog[];
  }

  return [];
}

export function deleteLogs(): Promise<void> {
  return rm(getLogPath());
}

export async function writeLogs(logs: UpgradeLog[]): Promise<void> {
  const logFilePath = getLogPath();
  await writeFile(logFilePath, JSON.stringify(logs, null, 2), { encoding: 'utf-8' });
}

export async function updateUpgradeLog(log: UpgradeLog) {
  const existingLogs = await readLogs();

  if (existingLogs.find((a) => a.id === log.id)) {
    await writeLogs(existingLogs.map((a) => (a.id === log.id ? log : a)));
  } else {
    await writeLogs([...existingLogs, log]);
  }
}
