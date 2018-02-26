import { Config } from '../config';
import { OS } from '../definitions';
import { addCommand } from '../tasks/add';
import { copyCommand } from '../tasks/copy';
import {
  check,
  checkAppId,
  checkAppName,
  checkWebDir,
  getOrCreateConfig,
  log,
  logError,
  logFatal,
  runCommand,
  runTask,
  writePrettyJSON
} from '../common';
import { cpAsync, existsAsync, mkdirAsync } from '../util/fs';
import { download } from '../util/http';
import { createTarExtraction } from '../util/archive';
import { emoji as _e } from '../util/emoji';
import { join, relative } from 'path';

const chalk = require('chalk');

export async function initCommand(config: Config, appName: string, appId: string) {
  try {
    await check(
      config,
      [
        (config) => checkAppName(config, appName),
        (config) => checkAppId(config, appId)
      ]
    );

    await runTask(`Initializing Capacitor project in ${chalk.blue(config.app.rootDir)}`, async () => {
      config.app.appId = appId;
      config.app.appName = appName;

      // Get or create our config
      await getOrCreateConfig(config);
    });

    await printNextSteps(config);
  } catch (e) {
    log('Usage: npx cap init appName appId\n');
    log('Example: npx cap init "My App" "com.example.myapp"\n');
    logFatal(e);
  }
}

async function promptNewProject(config: Config): Promise<boolean> {
  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'isNew',
    message: `Is this a new app? Answer 'n' if adding Capacitor to an existing project`,
    default: 'y'
  }]);

  return answers.isNew === 'y';
}

async function printExistingProjectMessage(config: Config) {
  log('\n\n');
  log(`${_e('🎈', '*')}   ${chalk.bold('Adding Capacitor to an existing project is easy:')}  ${_e('🎈', '*')}`);
  log(`\nnpm install --save @capacitor/cli @capacitor/core`);
  if (config.cli.os === OS.Mac) {
    log(`\nnpx capacitor add ios`);
  }
  log(`\nnpx capacitor add android`);
  log(`\nLearn more: https://capacitor.ionicframework.com/docs/getting-started/\n`);
}

/**
 * Add Android and iOS by default
 * @param config
 */
async function addPlatforms(config: Config) {
  await runTask(`Adding native platforms`, async () => {
    if (config.cli.os === OS.Mac) {
      await runTask(`Adding iOS platform`, async () => {
        await addCommand(config, 'ios');
      });
    }
    await runTask(`Adding Android platform`, async() => {
      await addCommand(config, 'android');
    });
  });
}

async function printNextSteps(config: Config) {
  log('\n');
  log(`${chalk.bold(`${_e('🎉', '*')}   Your Capacitor project is ready to go!  ${_e('🎉', '*')}`)}\n`);
  log(`Add platforms using "npx cap add":\n`);
  log(`  npx cap add android`);
  log(`  npx cap add ios`);
  log('');
  log(`Follow the Developer Workflow guide to get building:\n${chalk.bold(`https://capacitor.ionicframework.com/docs/basics/workflow`)}`);
}
