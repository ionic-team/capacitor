import { promisify } from 'util';
import { readFile, readdir, writeFile } from 'fs';
import chalk from 'chalk';
import { exec, exit, ls, which } from 'shelljs';
import { prompt } from 'inquirer';
import { exists } from 'fs';
import { ANDROID_PATH, IOS_PATH, PLATFORMS } from './config';
import { join } from 'path';
import ora = require('ora');
import { setTimeout } from 'timers';

export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const existsAsync = promisify(exists);
export const readdirAsync = promisify(readdir);

export type CheckFunction = () => Promise<string | null>;

export async function check(...checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map(f => f()));
  const errors = results.filter(r => r !== null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function readJSON(path: string): Promise<any> {
  const data = await readFileAsync(path, 'utf8');
  return JSON.parse(data);
}

export function logInfo(...args: any[]) {
  console.log(chalk.yellow('  [info]'), ...args);
}

export function logError(...args: any[]) {
  console.log(chalk.red('[error]'), ...args);
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

export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function runTask<T>(title: string, fn: () => Promise<T>): Promise<T> {
  const spinner = ora(title).start();
  try {
    const value = await fn();
    spinner.succeed();
    return value;
  } catch (e) {
    spinner.fail(e);
    throw e;
  }
}

export function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { async: true, silent: true }, (code, stdout, stderr) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stdout + stderr);
      }
    });
  });
}
