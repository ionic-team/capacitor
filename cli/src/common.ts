import { Config } from './config';
import { exec } from 'child_process';
import { setTimeout } from 'timers';
import { basename, dirname, join, parse, resolve } from 'path';
import { copyAsync, existsAsync, readFileAsync, renameAsync, writeFileAsync } from './util/fs';
import { existsSync, readFile } from 'fs';
import { emoji as _e } from './util/emoji';
import { isInteractive } from './util/term';
import * as semver from 'semver';

import * as inquirer from 'inquirer';

const chalk = require('chalk');

export type CheckFunction = (config: Config, ...args: any[]) => Promise<string | null>;

export async function check(config: Config, checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map(f => f(config)));
  const errors = results.filter(r => r != null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function checkWebDir(config: Config): Promise<string | null> {
  const invalidFolders = ['', '.', '..', '../', './'];
  if (invalidFolders.includes(config.app.webDir)) {
    return `"${config.app.webDir}" is not a valid value for webDir`;
  }
  if (!await existsAsync(config.app.webDirAbs)) {
    return `Capacitor could not find the web assets directory "${config.app.webDirAbs}".
    Please create it, and make sure it has an index.html file. You can change
    the path of this directory in capacitor.config.json.
    More info: https://capacitor.ionicframework.com/docs/basics/configuring-your-app`;
  }

  if (!await existsAsync(join(config.app.webDirAbs, 'index.html'))) {
    return `The web directory (${config.app.webDirAbs}) must contain a "index.html".
    It will be the entry point for the web portion of the Capacitor app.`;
  }
  return null;
}

export async function checkPackage(_config: Config): Promise<string | null> {
  if (!await existsAsync('package.json')) {
    return `Capacitor needs to run at the root of an npm package.
    Make sure you have a "package.json" in the directory where you run capacitor.
    More info: https://docs.npmjs.com/cli/init`;
  }
  return null;
}

export async function checkAppConfig(config: Config): Promise<string | null> {
  if (!config.app.appId) {
    return 'Missing appId for new platform. Please add it in capacitor.config.json or run npx cap init.';
  }
  if (!config.app.appName) {
    return 'Missing appName for new platform. Please add it in capacitor.config.json or run npx cap init.';
  }

  const appIdError = await checkAppId(config, config.app.appId);
  if (appIdError) {
    return appIdError;
  }

  const appNameError = await checkAppName(config, config.app.appName);
  if (appNameError) {
    return appNameError;
  }

  const npmClientError = await checkNpmClient(config, config.cli.npmClient);
  if (npmClientError) {
    return npmClientError;
  }

  return null;
}

export async function checkAppDir(config: Config, dir: string): Promise<string | null> {
  if (!/^\S*$/.test(dir)) {
    return `Your app directory should not contain spaces`;
  }
  return null;
}

export async function checkAppId(config: Config, id: string): Promise<string | null> {
  if (!id) {
    return `Invalid App ID. Must be in Java package form with no dashes (ex: com.example.app)`;
  }
  if (/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(id.toLowerCase())) {
    return null;
  }
  return `Invalid App ID "${id}". Must be in Java package form with no dashes (ex: com.example.app)`;
}

export async function checkAppName(config: Config, name: string): Promise<string | null> {
  // We allow pretty much anything right now, have fun
  if (!name || !name.length) {
    return `Must provide an app name. For example: 'Spacebook'`;
  }
  return null;
}

export async function checkNpmClient(config: Config, client: string): Promise<string | null> {
  // npm client must be npm, yarn, or undefined
  if (client && client !== 'npm' && client !== 'yarn') {
    return `npm client must be "npm" or "yarn". If you are not sure, choose "npm"`;
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
    readFile(path, 'utf8', async (err, xmlStr) => {
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

export function parseXML(xmlStr: string): any {
  const parseString = require('xml2js').parseString;
  var xmlObj;
  parseString(xmlStr, (err: any, result: any) => {
    if (!err) {
      xmlObj = result;
    }
  });
  return xmlObj;
}

export function writeXML(object: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const xml2js = await import('xml2js');
    const builder = new xml2js.Builder({ headless: true, explicitRoot: false, rootName: 'deleteme' });
    let xml = builder.buildObject(object);
    xml = xml.replace('<deleteme>', '').replace('</deleteme>', '');
    resolve(xml);
  });
}

export function buildXmlElement(configElement: any, rootName: string) {
  const xml2js = require('xml2js');
  const builder = new xml2js.Builder({ headless: true, explicitRoot: false, rootName: rootName });
  return builder.buildObject(configElement);
}

/**
 * Check for or create our main configuration file.
 * @param config
 */
export async function getOrCreateConfig(config: Config) {
  const configPath = join(config.app.rootDir, config.app.extConfigName);
  if (await existsAsync(configPath)) {
    return configPath;
  }

  await writePrettyJSON(config.app.extConfigFilePath, {
    appId: config.app.appId,
    appName: config.app.appName,
    bundledWebRuntime: config.app.bundledWebRuntime,
    npmClient: config.cli.npmClient,
    webDir: basename(resolve(config.app.rootDir, config.app.webDir))
  });

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
}

export async function mergeConfig(config: Config, settings: any) {
  const configPath = join(config.app.rootDir, config.app.extConfigName);

  await writePrettyJSON(config.app.extConfigFilePath, {
    ...config.app.extConfig,
    ...settings
  });

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
}

export function log(...args: any[]) {
  console.log(...args);
}

export function logSuccess(...args: any[]) {
  const chalk = require('chalk');
  console.log(chalk.green('[success]'), ...args);
}

export function logInfo(...args: any[]) {
  const chalk = require('chalk');
  console.log(chalk.bold.cyan('[info]'), ...args);
}

export function logWarn(...args: any[]) {
  const chalk = require('chalk');
  console.log(chalk.bold.yellow('[warn]'), ...args);
}

export function logError(...args: any[]) {
  const chalk = require('chalk');
  console.error(chalk.red('[error]'), ...args);
}

export function logFatal(...args: any[]): never {
  logError(...args);
  return process.exit(1);
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

export type TaskInfoProvider = (messsage: string) => void;

export async function runTask<T>(title: string, fn: (info: TaskInfoProvider) => Promise<T>): Promise<T> {
  const ora = require('ora');
  const spinner = ora(title).start();

  try {
    const start = process.hrtime();
    let taskInfoMessage;
    const value = await fn((message: string) => taskInfoMessage = message);
    const elapsed = process.hrtime(start);
    const chalk = require('chalk');
    if (taskInfoMessage) {
      spinner.info(`${title} ${chalk.dim('– ' + taskInfoMessage)}`);
    } else {
      spinner.succeed(`${title} ${chalk.dim('in ' + formatHrTime(elapsed))}`);
    }
    return value;

  } catch (e) {
    spinner.fail(`${title}: ${e.message ? e.message : ''}`);
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

export async function getName(config: Config, name: string) {
  if (!name) {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      default: config.app.appName ? config.app.appName : config.app.package.name ? config.app.package.name : 'App',
      message: `App name`
    }]);
    return answers.name;
  }
  return name;
}

export async function getAppId(config: Config, id: string) {
  if (!id) {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'id',
      default: config.app.appId ? config.app.appId : 'com.example.app',
      message: 'App Package ID (in Java package format, no dashes)'
    }]);
    return answers.id;
  }
  return id;
}

export function getNpmClient(config: Config, npmClient: string): Promise<string> {
  return new Promise(async (resolve) => {
    if (!npmClient) {
      if (await hasYarn(config)) return resolve('yarn');
      exec('yarn --version', async (err, stdout) => {
        // Don't show prompt if yarn is not installed
        if (err || !isInteractive()) {
          resolve('npm');
        } else {
          const answers = await inquirer.prompt([{
            type: 'list',
            name: 'npmClient',
            message: 'Which npm client would you like to use?',
            choices: ['npm', 'yarn']
          }]);
          resolve(answers.npmClient);
        }
      });
    } else {
      resolve(npmClient);
    }
  });
}

export async function copyTemplate(src: string, dst: string) {
  await copyAsync(src, dst);

  // npm renames .gitignore to something else, so our templates
  // have .gitignore as gitignore, we need to rename it here.
  const gitignorePath = join(dst, 'gitignore');
  if ( await existsAsync(gitignorePath)) {
    await renameAsync(gitignorePath, join(dst, '.gitignore'));
  }
}

export async function printNextSteps(config: Config, appDir: string) {
  log('\n');
  log(`${chalk.bold(`${_e('🎉', '*')}   Your Capacitor project is ready to go!  ${_e('🎉', '*')}`)}\n`);
  if (appDir !== '') {
    log(`Next steps:`);
    log('');
    log(chalk`cd {bold ./${appDir}}`);
    log('');
  }
  log(`Add platforms using "npx cap add":\n`);
  log(`  npx cap add android`);
  log(`  npx cap add ios`);
  log(`  npx cap add electron`);
  log('');
  log(`Follow the Developer Workflow guide to get building:\n${chalk.bold(`https://capacitor.ionicframework.com/docs/basics/workflow`)}\n`);
}

export async function checkPlatformVersions(config: Config, platform: string) {
  const cliPackagePath = resolveNode(config, '@capacitor/cli', 'package.json');
  if (!cliPackagePath) {
    logFatal('Unable to find node_modules/@capacitor/cli/package.json. Are you sure',
      '@capacitor/cli is installed? This file is currently required for Capacitor to function.');
    return;
  }

  const platformPackagePath = resolveNode(config, `@capacitor/${platform}`, 'package.json');
  if (!platformPackagePath) {
    logFatal(`Unable to find node_modules/@capacitor/${platform}/package.json. Are you sure`,
      `@capacitor/${platform} is installed? This file is currently required for Capacitor to function.`);
    return;
  }

  const cliVersion = (await readJSON(cliPackagePath)).version;
  const platformVersion = (await readJSON(platformPackagePath)).version;

  if (semver.gt(cliVersion, platformVersion)) {
    log('\n');
    logInfo(`Your @capacitor/cli version is greater than @capacitor/${platform} version`);
    log(`Consider updating to matching version ${chalk`{bold npm install @capacitor/${platform}@${cliVersion}}`}`);
  }
}

export function resolveNode(config: Config, ...pathSegments: any[]): string | null {
  const id = pathSegments[0];
  const path = pathSegments.slice(1);

  let modulePath;
  const starts = [config.app.rootDir];
  for (let start of starts) {
    modulePath = resolveNodeFrom(start, id);
    if (modulePath) {
      break;
    }
  }
  if (!modulePath) {
    return null;
  }

  return join(modulePath, ...path);
}

export function resolveNodeFrom(start: string, id: string): string | null {
  const rootPath = parse(start).root;
  let basePath = resolve(start);
  let modulePath;
  while (true) {
    modulePath = join(basePath, 'node_modules', id);
    if (existsSync(modulePath)) {
      return modulePath;
    }
    if (basePath === rootPath) {
      return null;
    }
    basePath = dirname(basePath);
  }
}

// Does the current project use yarn?
export const hasYarn = async (config: Config, projectDir?: string) => {
  // npmClient in config
  const npmClient = config.cli.npmClient;
  if (npmClient === 'yarn') {
    return true;
  } else if (npmClient === 'npm') {
    return false;
  }
  // yarn.lock
  return existsSync(join(projectDir || process.cwd(), 'yarn.lock'));
};

// Install deps with NPM or Yarn
export async function installDeps(projectDir: string, deps: string[], config: Config) {
  return runCommand(`cd "${projectDir}" && ${await hasYarn(config, projectDir) ? 'yarn add' : 'npm install --save'} ${deps.join(' ')}`);
}

export async function checkNPMVersion() {
  const minVersion = '5.5.0';
  const version = await runCommand('npm -v');
  const semver = await import('semver');
  if (semver.gt(minVersion, version)) {
    return `Capacitor CLI requires at least NPM ${minVersion}`;
  }
  return null;
}
