import { exec } from 'child_process';
import { join, resolve } from 'path';
import { existsAsync, readFileAsync } from '../src/util/fs';
const tmp = require('tmp');

export async function run(capCommand: string) {
  return new Promise((resolve, reject) => {
    exec(`bin/cap ${capCommand}`, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function mktmp(dir: string) {
  return new Promise((resolve, reject) => {
    tmp.dir((err, path, cleanupCallback) => {
      console.log('Created tmp path', path);
      if (err) {
        throw err;
      }

      console.log('RESOLVING', path);
      resolve({
        cleanupCallback,
        path: join(path, dir)
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