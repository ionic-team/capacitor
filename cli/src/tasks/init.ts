import { Config } from '../config';
import { OS } from '../definitions';
import { addCommand } from '../tasks/add';
import { checkWebDir, log, logError, logFatal, runCommand, runTask, writePrettyJSON } from '../common';
import { cpAsync, existsAsync, mkdirAsync } from '../util/fs';
import { download } from '../util/http';
import { createTarExtraction } from '../util/archive';
import { emoji as _e } from '../util/emoji';
import { join, relative } from 'path';

const chalk = require('chalk');

export async function initCommand(config: Config) {
  log(`\n${chalk.bold(`${_e('⚡️', '*')}  Initializing Capacitor project in ${chalk.blue(config.app.rootDir)}`)} ${_e('⚡️', '*')}`);
  log('\n');

  try {
    // Prompt for new or existing project
    const isNew = await promptNewProject(config);

    // Initializing an existing app
    if (!isNew) {
      await printExistingProjectMessage(config);
      return;
    }

    // Initialize a new project

    // Get or create our config
    await getOrCreateConfig(config);
    // Create the web directory
    await createWebDir(config);
    // Add our package.json
    await checkPackageJson(config);
    await seedProject(config);
    await installDeps(config);
    await addPlatforms(config);
    await printNextSteps(config);
  } catch (e) {
    logFatal(`Unable to initialize Capacitor. Please see errors and try again or file an issue`, e);
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
  log(`\nnpm run capacitor add ios android`);
  log(`\nLearn more: https://ionic-team.github.io/capacitor/docs/getting-started/\n`);
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

  await writePrettyJSON(config.app.extConfigFilePath, {
    webDir: relative(config.app.rootDir, config.app.webDir)
  });

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
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
  let command = 'npm install';
  await runTask(`Installing dependencies for seed project (${chalk.blue(command)})`, () => {
   return runCommand(command);
  });

  command = 'npm install --save @capacitor/core@latest @capacitor/cli@latest';
  await runTask(`Installing Capacitor dependencies (${chalk.blue(command)})`, () => {
   return runCommand(command);
  });
}

async function seedProject(config: Config) {
  await runTask(`Downloading and installing seed project`, async () => {
    const url = 'https://github.com/ionic-team/capacitor-starter/archive/master.tar.gz';
    const ws = await createTarExtraction({ cwd: config.app.rootDir, strip: 1 });
    await download(url, ws, {
      // progress: (loaded, total) => task.progress(loaded, total),
    });
    return Promise.resolve();
  });
}

/**
 * Add Android and iOS by default
 * @param config
 */
async function addPlatforms(config: Config) {
  await runTask(`Adding native platforms`, async () => {
    if (config.cli.os === OS.Mac) {
      await addCommand(config, 'ios');
    }
    return await addCommand(config, 'android');
  });
}

/**
 * Create the web directory and copy our default public assets
 * @param config
 * @param webDir
 */
async function createWebDir(config: Config) {
  const webDir = "public";
  try {
    await mkdirAsync(webDir);

    await runTask(`Creating ${config.app.extConfigName}`, () => {
      return writePrettyJSON(config.app.extConfigFilePath, {
        webDir: webDir
      });
    });

    await copyAppTemplatePublicAssets(config, webDir);
  } catch(e) {
    logError(`Unable to create web directory "${webDir}." You'll need to create it yourself or configure webDir in capacitor.config.json`);
  }
}

async function copyAppTemplatePublicAssets(config: Config, webDir: string) {
  await cpAsync(join(config.app.assets.templateDir, 'public'), webDir);
}

async function printNextSteps(config: Config) {
  log('\n');
  log(`${chalk.bold(`${_e('🎉', '*')}   Your Capacitor project is ready to go!  ${_e('🎉', '*')}`)}\n`);
  log(`Follow the Getting Started guide for next steps:\n${chalk.bold(`https://capacitor.ionicframework.com/docs/getting-started`)}`);
}
