import { exec } from 'child_process';
import { join, resolve } from 'path';
import { existsAsync, readFileAsync } from '../src/util/fs';
const tmp = require('tmp');

const cwd = process.cwd();

export async function run(appRoot: string, capCommand: string) {
  return new Promise((resolve, reject) => {
    exec(`cd ${appRoot} && ${cwd}/bin/cap ${capCommand}`, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function mktmp() {
  return new Promise((resolve, reject) => {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) {
        throw err;
      }

      resolve({
        cleanupCallback,
        path
      });
    });
  });
}

export function existsWithRoot(dir: string) {
  return (appFile) => {
    return existsAsync(resolve(dir, appFile));
  }
}

export async function exists(dir: string, appFile: string) {
  return existsAsync(resolve(dir, appFile));
}

export async function read(dir: string, appFile: string) {
  return readFileAsync(resolve(dir, appFile));
}