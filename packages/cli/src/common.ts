import { promisify } from 'util';
import { readFile, writeFile, readdir } from 'fs';
import chalk from 'chalk';
import { which, exec, ls, exit } from 'shelljs';
import { prompt } from 'inquirer';
import { exists } from "fs";
import { PLATFORMS, IOS_PATH, ANDROID_PATH } from './config';
import { join } from 'path';

export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const existsAsync = promisify(exists);
export const readdirAsync = promisify(readdir);

export async function readJSON(path: string): Promise<any> {
  const data = await readFileAsync(path, 'utf8');
  return JSON.parse(data);
}

export function log(...args: any[]) {
  console.log(chalk.green('[avocado]'), ...args);
}

export function logError(...args: any[]) {
  console.log(chalk.red('[avocado]'), ...args);
}

export function logFatal(...args: any[]) {
  logError(...args);
  exit(-1);
}

export function isInstalled(command: string): boolean {
  return !!which(command);
}

export function getRootPath(mode: string) {
  switch (mode) {
    case 'ios': return IOS_PATH;
    case 'android': return ANDROID_PATH;
  }
  throw 'unknown mode' + mode;
}

export async function askPlatform(platform: string | undefined): Promise<string> {
  if (!platform) {
    const answer = await prompt({
      type: 'list',
      name: 'mode',
      message: 'Choose an platform to update',
      choices: PLATFORMS
    });
    return answer.mode.toLowerCase();
  } else {
    return platform.toLowerCase();
  }
}

export function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, {
      async: true,
      silent: true,
    }, (code, stdout, stderr) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stdout + stderr);
      }
    });
  });
}
