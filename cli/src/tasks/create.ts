import { Config } from '../config';
import { copy } from './copy';

import {
  check,
  checkAppDir,
  checkAppId,
  checkAppName,
  checkNpmClient,
  getAppId,
  getName,
  getNpmClient,
  getOrCreateConfig,
  installDeps,
  log,
  logFatal,
  printNextSteps,
  runTask,
} from '../common';

import { copyAsync, existsAsync, mkdirAsync } from '../util/fs';
import { emoji as _e } from '../util/emoji';
import { checkInteractive } from '../util/term';

import inquirer from 'inquirer';
import chalk from 'chalk';

export async function createCommand(
  config: Config,
  dir: string,
  name: string,
  id: string,
  client: string,
) {
  try {
    if (!checkInteractive(dir, name, id)) {
      return;
    }

    // Get app name
    const appName = await getName(config, name);
    // Get app identifier
    const appId = await getAppId(config, id);
    // Prompt for app name if not provided
    const appDir = await getDir(config, dir);
    // Get npm client
    const npmClient = await getNpmClient(config, client);

    await check(config, [
      config => checkAppDir(config, dir),
      config => checkAppId(config, appId),
      config => checkAppName(config, appName),
      config => checkNpmClient(config, npmClient),
    ]);

    const cliVersion = require('../../package.json').version;
    log(
      chalk`\n{bold ${_e(
        '⚡️',
        '*',
      )}   Welcome to Capacitor (CLI v${cliVersion}) ${_e('⚡️', '*')}}\n`,
    );
    // Create the directory
    await makeDirectory(config, appDir);
    // Set current working directory for config
    config.setCurrentWorkingDir(appDir);

    // Set some default settings
    config.app.appName = appName;
    config.app.appId = appId;
    config.app.bundledWebRuntime = true;
    config.cli.npmClient = npmClient;

    await getOrCreateConfig(config);

    // Copy the starter project
    await create(config, appDir, appName, appId);
    // npm install
    await runTask(chalk`Installing dependencies`, () => {
      return installDeps(appDir, ['@capacitor/cli', '@capacitor/core'], config);
    });
    // Copy web and capacitor to web assets
    await copy(config, config.web.name);
    // Say something nice
    printNextSteps(config, appDir);
  } catch (e) {
    // String errors are our check errors (most likely)
    if (typeof e === 'string') {
      log('Usage: npx @capacitor/cli create appDir appName appId npmClient?');
      log(
        'Example: npx @capacitor/cli create my-app "My App" "com.example.myapp"',
      );
    }

    logFatal(e);
  }
}

async function getDir(config: Config, dir: string) {
  if (!dir) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'dir',
        message: `Directory for new app`,
        validate: function (input) {
          if (!input || input.trim() === '') {
            return false;
          }
          return true;
        },
      },
    ]);
    return answers.dir;
  }
  return dir;
}

async function makeDirectory(config: Config, dir: string) {
  if (await existsAsync(dir)) {
    logFatal(
      `The directory ${chalk.bold(
        dir,
      )} already exists. Please remove it before creating your app`,
    );
  }

  await mkdirAsync(dir);
}

export async function create(
  config: Config,
  dir: string,
  appName: string,
  appId: string,
) {
  const templateDir = config.app.assets.templateDir;

  await runTask(
    chalk`Creating app {bold ${appName}} in {bold ${dir}} with id {bold ${appId}}`,
    () => {
      return copyAsync(templateDir, dir);
    },
  );
}
