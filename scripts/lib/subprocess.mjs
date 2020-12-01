import * as cp from 'child_process';
import * as util from 'util';

export const exec = util.promisify(cp.exec);
export const spawn = cp.spawn;
export const run = (cmd, args, options) => wait(spawn(cmd, args, options));
export const wait = async p => {
  return new Promise((resolve, reject) => {
    p.on('error', reject);

    p.on('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`bad subprocess exit (code=${code}, signal=${signal})`),
        );
      }
    });
  });
};
