import { Config } from '../config';
import { OS } from '../definitions';
import { addAndroid } from '../android/add';
import { addElectron } from '../electron/add';
import { addIOS, addIOSChecks } from '../ios/add';
import { editProjectSettingsAndroid } from '../android/common';
import { editProjectSettingsIOS } from '../ios/common';
import { check, checkAppConfig, checkPackage, checkWebDir, logFatal, logInfo, runTask, writePrettyJSON } from '../common';
import { sync } from './sync';

import chalk from 'chalk';
import { resolve } from 'path';

export async function addCommand(config: Config, selectedPlatformName: string) {
  if (selectedPlatformName === 'ios' && config.cli.os !== 'mac') {
    logFatal('Not running Mac OS X, can\'t add ios platform');
  }

  const platformName = await config.askPlatform(
    selectedPlatformName,
    `Please choose a platform to add:`
  );

  const existingPlatformDir = config.platformDirExists(platformName);
  if (existingPlatformDir) {
    logFatal(`"${platformName}" platform already exists.
    To add a new "${platformName}" platform, please remove "${existingPlatformDir}" and run this command again.
    WARNING! your native IDE project will be completely removed.`);
  }

  try {
    await check(
      config,
      [checkPackage, checkAppConfig, ...addChecks(config, platformName)]
    );
    await generateCapacitorConfig(config);
    await check(config, []); // , [checkWebDir]);
    await doAdd(config, platformName);
    await editPlatforms(config, platformName);

    if (shouldSync(config, platformName)) {
      await sync(config, platformName);
    }
  } catch (e) {
    logFatal(e);
  }
}

export async function generateCapacitorConfig(config: Config) {
  if (config.foundExternalConfig()) {
    return;
  }

  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'webDir',
    message: 'What directory are your web assets in? (index.html, built JavaScript, etc.):',
    default: 'www'
  }]);
  const webDir = answers.webDir;
  await runTask(`Creating ${config.app.extConfigName}`, () => {
    return writePrettyJSON(config.app.extConfigFilePath, {
      webDir: webDir
    });
  });
  logInfo(`💡 You can change the web directory anytime by modifing ${config.app.extConfigName}`);
  config.app.webDir = webDir;
  config.app.webDirAbs = resolve(config.app.rootDir, webDir);
}

export function addChecks(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    return addIOSChecks;
  } else if (platformName === config.android.name) {
    return [];
  } else if (platformName === config.web.name) {
    return [];
  } else if (platformName === config.electron.name) {
    return [];
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

export async function doAdd(config: Config, platformName: string) {
  await runTask(chalk`{green {bold add}}`, async () => {
    if (platformName === config.ios.name) {
      await addIOS(config);
    } else if (platformName === config.android.name) {
      await addAndroid(config);
    } else if (platformName === config.electron.name) {
      await addElectron(config);
    }
  });
}

async function editPlatforms(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await editProjectSettingsIOS(config);
  } else if (platformName === config.android.name) {
    await editProjectSettingsAndroid(config);
  }
}

function shouldSync(config: Config, platformName: string) {
  // Don't sync if we're adding the iOS platform not on a mac
  if (config.cli.os !== OS.Mac && platformName === "ios") {
    return false;
  }
  return true;
}