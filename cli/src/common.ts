import { promisify } from 'util';
import { readFile, readdir, readdirSync, writeFile } from 'fs';
import chalk from 'chalk';
import { exec, exit, which } from 'shelljs';
import { prompt } from 'inquirer';
import { exists } from 'fs';
import { ANDROID_PATH, ASSETS_PATH, IOS_PATH, PLATFORMS } from './config';
import { resolve } from 'path';
import ora = require('ora');
import { setTimeout } from 'timers';
import { PROJECT_DIR } from './index';

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

export function getAssetsPath(resource: string): string {
  return resolve(PROJECT_DIR, ASSETS_PATH, resource);
}

export function getRootPath(mode: string) {
  switch (mode) {
    case 'ios': return IOS_PATH;
    case 'android': return ANDROID_PATH;
  }
  throw 'unknown mode' + mode;
}

export async function askPlatform(platform: string, promptMessage: string): Promise<string> {
  if (!platform) {
    const answer = await prompt({
      type: 'list',
      name: 'mode',
      message: promptMessage,
      choices: PLATFORMS
    });
    return answer.mode.toLowerCase().trim();
  }

  platform = platform.toLowerCase().trim();

  if (!isValidPlatform(platform)) {
    logFatal(`Invalid platform: ${platform}`);
  }

  return platform;
}

export function getPlatforms(platform?: string) {
  const platforms: string[] = [];

  const appDirs = readdirSync(PROJECT_DIR);

  if (platform) {
    platform = platform.toLowerCase().trim();

    if (!isValidPlatform(platform)) {
      logFatal(`Invalid platform: ${platform}`);

    } else if (!appDirs.includes(platform)) {
      platformNotCreatedError(platform);

    } else {
      platforms.push(platform);
    }

  } else {
    appDirs.forEach(appDir => {
      const dir = appDir.toLowerCase();
      if (isValidPlatform(dir)) {
        platforms.push(dir);
      }
    });
  }

  if (!platforms.length) {
    logFatal(`No platforms found in: ${PROJECT_DIR}`);
  }

  return platforms;
}

function platformNotCreatedError(platform: string) {
  logFatal(`"${platform}" platform has not been created. Please use "avocado create ${platform}" command to first create the platform.`);
}

export function isValidPlatform(platform: string) {
  platform = platform.toLowerCase().trim();
  return PLATFORMS.includes(platform);
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
