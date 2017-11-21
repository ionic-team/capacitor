import { promisify } from 'util';
import { readFile, writeFile, readdir } from 'fs';
import chalk from 'chalk';
import { which, exec } from 'shelljs';
import { prompt } from 'inquirer';

export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const readdirAsync = promisify(readdir);
export const PLATFORMS = ['iOS', 'android'];

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

export function isInstalled(command: string): boolean {
  return !!which(command);
}

export function checkEnvironment() {
  if (!isInstalled('pod')) {
    throw 'cocoapods is not installed. For information: https://guides.cocoapods.org/using/getting-started.html#installation';
  }
}

export async function askMode(mode: string | undefined): Promise<string> {
  if (!mode) {
    const answer = await prompt({
      type: 'list',
      name: 'mode',
      message: 'Choose an platform to update',
      choices: PLATFORMS
    });
    return answer.mode.toLowerCase();
  } else {
    return mode.toLowerCase();
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