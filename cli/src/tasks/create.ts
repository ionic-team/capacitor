import { Config } from '../config';
import { OS } from '../definitions';
import { addAndroid } from '../android/add';
import { addIOS, addIOSChecks } from '../ios/add';
import { copy } from './copy';
import { editProjectSettingsAndroid } from '../android/common';
import { editProjectSettingsIOS } from '../ios/common';
import { sync } from './sync';

import {
  check,
  checkAppDir,
  checkAppId,
  checkAppName,
  checkPackage,
  checkWebDir,
  getAppId,
  getName,
  getOrCreateConfig,
  log,
  logFatal,
  runCommand,
  runTask
} from '../common';

import { cpAsync, existsAsync, mkdirAsync } from '../util/fs';
import { emoji as _e } from '../util/emoji'; 
import { basename, join } from 'path';

import * as inquirer from 'inquirer';
import chalk from 'chalk';

export async function createCommand(config: Config, dir: string, name: string, id: string) {

  try {
    // Get app name
    const appName = await getName(config, name);
    // Get app identifier
    const appId = await getAppId(config, id);
    // Prompt for app name if not provided
    const appDir = await getDir(config, dir);

    await check(
      config,
      [
        (config) => checkAppDir(config, dir),
        (config) => checkAppId(config, appId),
        (config) => checkAppName(config, appName)
      ]
    );

    const cliVersion = require('../../package.json').version;
    log(chalk`\n{bold ${_e('⚡️', '*')}   Welcome to Capacitor (CLI v${cliVersion}) ${_e('⚡️', '*')}}\n`);
    // Create the directory
    await makeDirectory(config, appDir);
    // Set current working directory for config
    config.setCurrentWorkingDir(appDir);

    // Set some default settings
    config.app.appName = appName;
    config.app.appId = appId;
    config.app.bundledWebRuntime = true;

    await getOrCreateConfig(config);

    // Copy the starter project
    await create(config, appDir, appName, appId);
    // npm install
    await installDeps(config, appDir);
    // Add default platforms (ios on mac, android)
    await addPlatforms(config, appDir);
    // Apply project-specific settings to platform projects
    await editPlatforms(config, appName, appId);
    // Copy web and capacitor to web assets
    await copy(config, config.web.name);
    // Say something nice
    printNextSteps(config, appDir);
  } catch (e) {
    // String errors are our check errors (most likely)
    if (typeof e === 'string') {
      log('Usage: npx @capacitor/cli create appDir appName appId');
      log('Example: npx @capacitor/cli create my-app "My App" "com.example.myapp"');
    }

    logFatal(e);
  }
}

async function getDir(config: Config, dir: string) {
  if (!dir) {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'dir',
      message: `Directory for new app`
    }]);
    return answers.dir;
  }
  return dir;
}

async function makeDirectory(config: Config, dir: string) {
  if (await existsAsync(dir)) {
    logFatal(`The directory ${chalk.bold(dir)} already exists. Please remove it before creating your app`);
  }

  await mkdirAsync(dir);
}

export async function create(config: Config, dir: string, appName: string, appId: string) {
  const templateDir = config.app.assets.templateDir;

  await runTask(chalk`Creating app {bold ${appName}} in {bold ${dir}} with id {bold ${appId}}`, () => {
    return cpAsync(templateDir, dir);
  });
}

async function installDeps(config: Config, dir: string) {
  await runTask(chalk`Installing dependencies`, async () => {
    return runCommand(`cd "${dir}" && npm install --save @capacitor/cli @capacitor/core`);
  });
}

async function addPlatforms(config: Config, dir: string) {
  await runTask(chalk`{green {bold add}} default platforms`, async () => {
    if (config.cli.os === OS.Mac) {
      await addIOS(config);
      await sync(config, config.ios.name);
    }
    await addAndroid(config);
    await sync(config, config.android.name);
  });
}

async function editPlatforms(config: Config, appName: string, appId: string) {
  if (config.cli.os === OS.Mac) {
    await editProjectSettingsIOS(config);
  }
  await editProjectSettingsAndroid(config);
}

function printNextSteps(config: Config, appDir: string) {
  log(chalk`{green ✔} Your app is ready!`);
  log(`\nNext steps:`);
  log(chalk`cd {bold ./${appDir}}`);
  log(`Get to work by following the Capacitor Development Workflow: https://capacitor.ionicframework.com/docs/basics/workflow`);
}
