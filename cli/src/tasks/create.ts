import { Config } from '../config';
import { createAndroid } from '../android/create';
import { createIOS, createIOSChecks } from '../ios/create';
import { check, checkPackage, checkWebDir, logFatal, logInfo, runTask, writeJSON } from '../common';
import { sync } from './sync';
import { open } from './open';


export async function createCommand(config: Config, selectedPlatformName: string) {
  const platformName = await config.askPlatform(
    selectedPlatformName,
    `Please choose a platform to create:`
  );

  const existingPlatformDir = config.platformDirExists(platformName);
  if (existingPlatformDir) {
    logFatal(`"${platformName}" platform already exists.
    To create a new "${platformName}" platform, please remove "${existingPlatformDir}" and run this command again.
    WARNING! your xcode setup will be completely removed.`);
  }

  try {
    await check(
      config,
      [checkPackage, ...createChecks(config, platformName)]
    );
    await generateAvocadoConfig(config);
    await check(config, [checkWebDir]);
    await create(config, platformName);
    await sync(config, platformName);
    await open(config, platformName);

  } catch (e) {
    logFatal(e);
  }
}

export async function generateAvocadoConfig(config: Config) {
  if (config.foundExternalConfig) {
    return;
  }

  logInfo(`Remember you can change the web directory anytime by modifing ${config.app.extConfigName}`);
  const inquirer = require('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'webDir',
    message: 'web directory:',
    default: 'www'
  }]);
  const webDir = answers.webDir;
  await runTask(`Creating ${config.app.extConfigName}`, () => {
    return writeJSON(config.app.extConfigFilePath, {
      webDir: webDir
    });
  });
  config.app.webDir = webDir;
}

export function createChecks(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    return createIOSChecks;
  } else if (platformName === config.android.name) {
    return [];
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

export async function create(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await createIOS(config);
  } else if (platformName === config.android.name) {
    await createAndroid(config);
  }
}
