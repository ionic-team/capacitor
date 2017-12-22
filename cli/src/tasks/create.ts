import { Config } from '../config';
import { logFatal, runTask } from '../common';
import { addIOS } from '../ios/add';
import { existsSync, mkdir, cp } from '../util/fs';
const chalk = require('chalk');

export async function createCommand (config: Config, directory: string, name: string, identifier: string) {

  const existingApp = existsSync(directory);

  if (existingApp) {
    logFatal(`"${directory}" already exists.
    To create a new app in ${directory}, please remove it and run this command again.`);
  }

  try {
    await createApp(config, directory, name, identifier);
    config.setCurrentWorkingDir(directory);
    await addIOS(config);
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

export async function createApp(config: Config, directory: string, name: string, identifier: string) {
  await mkdir(directory);

  const templateDir = config.app.assets.templateDir;

  await runTask(chalk`Creating app {bold ${name}} in {bold ${directory}} with id {bold ${identifier}}`, () => {
    return cp(templateDir, directory);
  });
}

