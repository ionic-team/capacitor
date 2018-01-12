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
    await addPlatforms(config);
  } catch (e) {
    logFatal(e);
  }
}

async function getOrCreateConfig(config: Config) {
  const configPath = join(config.app.rootDir, config.app.extConfigName);
  if (await existsAsync(configPath)) {
    return configPath;
  }

  await writePrettyJSON(config.app.extConfigFilePath, {});

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
}

async function getOrCreateWebDir(config: Config) {
  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'webDir',
    message: 'What directory will your built web assets be in? (index.html, built JavaScript, etc.):',
    default: 'public'
  }]);

  const webDir = answers.webDir;
  if (!await existsAsync(config.app.webDir)) {
    await createWebDir(config, webDir);
  }
  config.app.webDir = webDir;
}

async function checkPackageJson(config: Config) {
  if (!await existsAsync(join(config.app.rootDir, 'package.json'))) {
    await cpAsync(join(config.app.assets.templateDir, 'package.json'), 'package.json');
  }

  await runCommand('npm install --save @capacitor/core @capacitor/cli');
}

async function addPlatforms(config: Config) {
  await addCommand(config, 'ios');
  await addCommand(config, 'android');
}

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
