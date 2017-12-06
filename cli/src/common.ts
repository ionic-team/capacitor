import { Config } from './config';
import { copy, emptyDir } from 'fs-extra';
import { exec, exit, which } from 'shelljs';
import { exists, readFile, readdir, writeFile  } from 'fs';
import { promisify } from 'util';
import { setTimeout } from 'timers';


export const copyAsync = promisify(copy);
export const emptyDirAsync = promisify(emptyDir);
export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const existsAsync = promisify(exists);
export const readdirAsync = promisify(readdir);

export type CheckFunction = (config: Config) => Promise<string | null>;


export async function check(config: Config, checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map(f => f(config)));
  const errors = results.filter(r => r !== null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function checkPackage(config: Config): Promise<string | null> {
  config;
  if (!await existsAsync('package.json')) {
    return `Avocado needs to run at the root of a NPM package.
    Make sure you have a "package.json" in the working directory you run avocado.
    More info: https://docs.npmjs.com/cli/init`;
  }
  return null;
}

export async function readJSON(path: string): Promise<any> {
  const data = await readFileAsync(path, 'utf8');
  return JSON.parse(data);
}


export function logInfo(...args: any[]) {
  const chalk = require('chalk');
  console.log(chalk.yellow('  [info]'), ...args);
}


export function logError(...args: any[]) {
  const chalk = require('chalk');
  console.log(chalk.red('[error]'), ...args);
}


export function logFatal(...args: any[]) {
  logError(...args);
  exit(-1);
}


export function isInstalled(command: string): boolean {
  return !!which(command);
}


export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


export async function runTask<T>(title: string, fn: () => Promise<T>): Promise<T> {
  const ora = require('ora');
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
