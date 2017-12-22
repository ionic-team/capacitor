import { Config } from '../config';
import { addAndroid } from '../android/add';
import { addIOS, addIOSChecks } from '../ios/add';
import { add, checkPackage, checkWebDir, logFatal, logInfo, runTask, writePrettyJSON } from '../common';
import { sync } from './sync';
import { open } from './open';


export async function addCommand(config: Config, selectedPlatformName: string) {
  const platformName = await config.askPlatform(
    selectedPlatformName,
    `Please choose a platform to add:`
  );

  const existingPlatformDir = config.platformDirExists(platformName);
  if (existingPlatformDir) {
    logFatal(`"${platformName}" platform already exists.
    To add a new "${platformName}" platform, please remove "${existingPlatformDir}" and run this command again.
    WARNING! your xcode setup will be completely removed.`);
  }

  try {
    await add(
      config,
      [checkPackage, ...addChecks(config, platformName)]
    );
    await generateAvocadoConfig(config);
    await add(config, [checkWebDir]);
    await doAdd(config, platformName);
    await sync(config, platformName);
    await open(config, platformName);

  } catch (e) {
    logFatal(e);
  }
}

export async function generateAvocadoConfig(config: Config) {
  if (config.foundExternalConfig()) {
    return;
  }

  logInfo(`Remember you can change the web directory anytime by modifing ${config.app.extConfigName}`);
  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'webDir',
    message: 'web directory:',
    default: 'www'
  }]);
  const webDir = answers.webDir;
  await runTask(`Creating ${config.app.extConfigName}`, () => {
    return writePrettyJSON(config.app.extConfigFilePath, {
      webDir: webDir
    });
  });
  config.app.webDir = webDir;
}

export function addChecks(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    return addIOSChecks;
  } else if (platformName === config.android.name) {
    return [];
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

export async function doAdd(config: Config, platformName: string) {
  if (platformName === config.ios.name) {
    await addIOS(config);
  } else if (platformName === config.android.name) {
    await addAndroid(config);
  }
}
