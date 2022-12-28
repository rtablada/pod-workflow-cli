import { exec } from 'child_process';

export const runCommand = (cmd) =>
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
