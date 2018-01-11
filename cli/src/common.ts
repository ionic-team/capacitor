import { Config } from './config';
import { exec } from 'child_process';
import { setTimeout } from 'timers';
import { join } from 'path';
import { existsAsync, readFileAsync, writeFileAsync } from './util/fs';
import { readFile } from 'fs';

export type CheckFunction = (config: Config) => Promise<string | null>;


export async function add(config: Config, checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map(f => f(config)));
  const errors = results.filter(r => r != null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function checkWebDir(config: Config): Promise<string | null> {
  if (!await existsAsync(config.app.webDir)) {
    return `Capacitor could not find the directory with the web assets in "${config.app.webDir}".
    Please create it, also remember that it must include a index.html.
    More info: https://getcapacitor.com/docs/webDir`;
  }

  if (!await existsAsync(join(config.app.webDir, 'index.html'))) {
    return `The web directory (${config.app.webDir}) must contain a "index.html".
    It will be the entry point for the web portion of the Capacitor app.`;
  }
  return null;
}

export async function checkPackage(config: Config): Promise<string | null> {
  config;
  if (!await existsAsync('package.json')) {
    return `Capacitor needs to run at the root of a NPM package.
    Make sure you have a "package.json" in the working directory you run capacitor.
    More info: https://docs.npmjs.com/cli/init`;
  }
  return null;
}

export async function readJSON(path: string): Promise<any> {
  const data = await readFileAsync(path, 'utf8');
  return JSON.parse(data);
}

export function writePrettyJSON(path: string, data: any) {
  return writeFileAsync(path, JSON.stringify(data, null, '  ') + '\n');
}

export function readXML(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf-8', async (err, xmlStr) => {
      if (err) {
        reject(`Unable to read: ${path}`);

      } else {
        const xml2js = await import('xml2js');
        xml2js.parseString(xmlStr, (err, result) => {
          if (err) {
            reject(`Error parsing: ${path}, ${err}`);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
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

export async function runTask<T>(title: string, fn: () => Promise<T>): Promise<T> {
  const ora = require('ora');
  const spinner = ora(title).start();

  try {
    const start = process.hrtime();
    const value = await fn();
    const elapsed = process.hrtime(start);
    const chalk = require('chalk');
    spinner.succeed(`${title} ${chalk.dim('in ' + formatHrTime(elapsed))}`);
    return value;

  } catch (e) {
    spinner.stop();
    throw e;
  }
}

const TIME_UNITS = ['s', 'ms', 'μp'];
export function formatHrTime(hrtime: any) {
  let time = (hrtime[0] + (hrtime[1] / 1e9)) as number;
  let index = 0;
  for (; index < TIME_UNITS.length - 1; index++ , time *= 1000) {
    if (time >= 1) {
      break;
    }
  }
  return time.toFixed(2) + TIME_UNITS[index];
}
