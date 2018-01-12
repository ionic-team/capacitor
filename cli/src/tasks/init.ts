import { Config } from '../config';
import { addCommand } from '../tasks/add';
import { checkWebDir, log, logFatal, runCommand, runTask, writePrettyJSON } from '../common';
import { cpAsync, existsAsync, mkdirAsync } from '../util/fs';

import { join } from 'path';

const chalk = require('chalk');

export async function initCommand(config: Config) {
  log(`${chalk.bold(`⚡️  Initializing Capacitor project in ${chalk.blue(config.cli.rootDir)}`)} ⚡️`);

  try {
    await getOrCreateConfig(config);
    await getOrCreateWebDir(config);
    await checkPackageJson(config);
    await installDeps(config);
    await addPlatforms(config);
  } catch (e) {
    logFatal(e);
  }
}

/**
 * Check for or create our main configuration file.
 * @param config
 */
async function getOrCreateConfig(config: Config) {
  const configPath = join(config.app.rootDir, config.app.extConfigName);
  if (await existsAsync(configPath)) {
    return configPath;
  }

  await writePrettyJSON(config.app.extConfigFilePath, {});

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
}

/**
 * Check for or create the main web assets directory (i.e. public/)
 * @param config
 */
async function getOrCreateWebDir(config: Config) {
  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'webDir',
    message: 'What directory will your built web assets be in?',
    default: 'public'
  }]);

  const webDir = answers.webDir;
  if (!await existsAsync(config.app.webDir)) {
    await createWebDir(config, webDir);
  }
  config.app.webDir = webDir;
}

/**
 * Check for or create the main package.json file
 * @param config
 */
async function checkPackageJson(config: Config) {
  if (!await existsAsync(join(config.app.rootDir, 'package.json'))) {
    await cpAsync(join(config.app.assets.templateDir, 'package.json'), 'package.json');
  }
}

async function installDeps(config: Config) {
  let command = 'npm install --save @capacitor/core @capacitor/cli';
  await runTask(`Installing Capacitor dependencies (${chalk.blue(command)})`, () => {
   return runCommand(command);
  });
}

/**
 * Add Android and iOS by default
 * @param config
 */
async function addPlatforms(config: Config) {
  await addCommand(config, 'ios');
  await addCommand(config, 'android');
}

/**
 * Create the web directory and copy our default public assets
 * @param config
 * @param webDir
 */
async function createWebDir(config: Config, webDir: string) {

  await mkdirAsync(webDir);

  await runTask(`Creating ${config.app.extConfigName}`, () => {
    return writePrettyJSON(config.app.extConfigFilePath, {
      webDir: webDir
    });
  });

  await copyAppTemplatePublicAssets(config, webDir);
}

async function copyAppTemplatePublicAssets(config: Config, webDir: string) {
  await cpAsync(join(config.app.assets.templateDir, 'public'), webDir);
}
