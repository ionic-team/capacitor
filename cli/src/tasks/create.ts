import { Config } from '../config';
import { OS } from '../definitions';
import { addAndroid } from '../android/add';
import { addIOS, addIOSChecks } from '../ios/add';
import { editProjectSettingsAndroid } from '../android/common';
import { editProjectSettingsIOS } from '../ios/common';
import { sync } from './sync';
import { check, checkPackage, checkWebDir, log, logFatal, runCommand, runTask, writePrettyJSON } from '../common';
import { cpAsync, existsAsync, mkdirAsync } from '../util/fs';
import { emoji as _e } from '../util/emoji'; 
import { basename, join } from 'path';

import * as inquirer from 'inquirer';
import chalk from 'chalk';

export async function createCommand(config: Config, dir: string, name: string, id: string) {
  const cliVersion = require('../../package.json').version;
  log(chalk`\n{bold ${_e('⚡️', '*')}   Welcome to Capacitor (CLI v${cliVersion}) ${_e('⚡️', '*')}}\n`);
  try {
    // Prompt for app name if not provided
    const appDir = await getDir(config, dir);
    // Create the directory
    await makeDirectory(config, appDir);
    // Set current working directory for config
    config.setCurrentWorkingDir(appDir);
    // Get app name
    const appName = await getName(config, name);
    // Get app identifier
    const appId = await getIdentifier(config, id);
    // Copy the starter project
    await create(config, appDir, appName, appId);
    // npm install
    await installDeps(config, appDir);
    // Add default platforms (ios on mac, android)
    await addPlatforms(config, appDir);
    // Apply project-specific settings to platform projects
    await editPlatforms(config, appName, appId);
    // Say something nice
    await printNextSteps(config);
  } catch (e) {
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
    return answers.dir; }
  return dir;
}

async function getName(config: Config, name: string) {
  if (!name) {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      default: 'App',
      message: `App name`
    }]);
    return answers.name;
  }
  return name;
}

async function getIdentifier(config: Config, id: string) {
  if (!id) {
    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'id',
      default: 'com.example.app',
      message: 'App/Bundle ID'
    }]);
    return answers.id;
  }
  return id;
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
    return runCommand(`cd ${dir} && npm install --save @capacitor/cli @capacitor/core`);
  })
}

async function addPlatforms(config: Config, dir: string) {
  await runTask(chalk`Adding initial platforms`, async () => {
    if (config.cli.os == OS.Mac) {
      await addIOS(config);
      await sync(config, config.ios.name);
    }
    await addAndroid(config);
    await sync(config, config.android.name);
  });
}

async function editPlatforms(config: Config, appName: string, appId: string) {
  if (config.cli.os == OS.Mac) {
    await editProjectSettingsIOS(config, appName, appId);
  }
  await editProjectSettingsAndroid(config, appName, appId);
}

async function printNextSteps(config: Config) {
  log(chalk`{green ✔} Your app is ready!`);
  log(`\nNext steps:`)
  log(`cd ./${basename(config.app.rootDir)}`);
  log(`Get to work by following the Capacitor Development Workflow: https://capacitor.ionicframework.com/docs/basics/workflow`);
}

export async function editCommand(config: Config, appName: string, appId: string) {
  await editProjectSettingsIOS(config, appName, appId);
  await editProjectSettingsAndroid(config, appName, appId);
}