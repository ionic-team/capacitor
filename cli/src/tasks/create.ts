import { Config } from '../config';
import { logFatal } from '../common';
import { existsSync, mkdir } from '../util/fs';
const chalk = require('chalk');

export async function createCommand (config: Config, directory: string, name: string, identifier: string) {
  console.log(chalk`Creating app {bold ${name}} in {bold ${directory}} with id {bold ${identifier}}`);

  const existingApp = existsSync(directory);

  if (existingApp) {
    logFatal(`"${directory}" already exists.
    To create a new app in ${directory}, please remove it and run this command again.`);
  }

  try {
    await doCreate(config, directory, name, identifier);
    /*
    await generateAvocadoConfig(config);
    await add(config, [checkWebDir]);
    await create(config, platformName);
    await sync(config, platformName);
    await open(config, platformName);
    */

  } catch (e) {
    logFatal(e);
  }
}

async function doCreate(config: Config, directory: string, name: string, identifier: string) {
  await mkdir(directory);
}

