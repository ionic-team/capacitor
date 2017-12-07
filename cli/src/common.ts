import { Config } from './config';
import { emptyDir } from 'fs-extra';
import { exec } from 'child_process';
import { exists, readFile, readdir, writeFile  } from 'fs';
import { promisify } from 'util';
import { setTimeout } from 'timers';
import { join } from 'path';


export const emptyDirAsync = promisify(emptyDir);
export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const existsAsync = promisify(exists);
export const readdirAsync = promisify(readdir);

export type CheckFunction = (config: Config) => Promise<string | null>;


export async function check(config: Config, checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map(f => f(config)));
  const errors = results.filter(r => r != null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function checkWebDir(config: Config): Promise<string | null> {
  if (!await existsAsync(config.app.webDir)) {
    return `Avocado could not find the directory with the web assets in "${config.app.webDir}".
    Please create it, also remember that it must include a index.html.
    More info: https://avocadojs.com/docs/webDir`;
  }

  if (!await existsAsync(join(config.app.webDir, 'index.html'))) {
    return `The web directory (${config.app.webDir}) must contain a "index.html".
    It will be the entry point for the avocado hybrid app.`;
  }
  return null;
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

export function writeJSON(path: string, data: any) {
  return writeFileAsync(path, JSON.stringify(data, null, '  ') + '\n');
}

export function logSuccess(...args: any[]) {
  const chalk = require('chalk');
  console.log(chalk.green('[success]'), ...args);
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
  process.exit(1);
}

export async function isInstalled(command: string): Promise<boolean> {
  const which = await import('which');
  return new Promise<boolean>((resolve) => {
    which(command, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
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
    spinner.stop();
    throw e;
  }
}

export function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}
