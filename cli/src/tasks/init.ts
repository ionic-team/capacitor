import { Config } from '../config';
import { checkWebDir, log, logFatal, runTask, writePrettyJSON } from '../common';
import { cpAsync, existsAsync, mkdirAsync } from '../util/fs';

import { join } from 'path';

const chalk = require('chalk');

export async function initCommand(config: Config) {
  log(`${chalk.bold(`⚡️  Initializing Capacitor project in ${chalk.blue(config.cli.rootDir)}`)} ⚡️`);

  try {
    if (!await existsAsync(config.app.webDir)) {
      await createWebDir(config);
    }
  } catch (e) {
    logFatal(e);
  }
}

async function createWebDir(config: Config) {
  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'webDir',
    message: 'What directory will your built web assets be in? (index.html, built JavaScript, etc.):',
    default: 'public'
  }]);
  const webDir = answers.webDir;

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
