import * as program from 'commander';
import chalk from 'chalk';

import { createCommand } from './tasks/create';
import { initCommand } from './tasks/init';
import { copyCommand } from './tasks/copy';
import { listCommand } from './tasks/list';
import { updateCommand } from './tasks/update';
import { openCommand } from './tasks/open';
import { serveCommand } from './tasks/serve';
import { syncCommand } from './tasks/sync';
import { Config } from './config';
import { addCommand } from './tasks/add';
import { newPluginCommand } from './tasks/new-plugin';
import { doctorCommand } from './tasks/doctor';
import { emoji as _e } from './util/emoji';

process.on('unhandledRejection', error => {
  const chalk = require('chalk');
  console.error(chalk.red('[fatal]'), error);
});

export function run(process: NodeJS.Process, cliBinDir: string) {
  const config = new Config(process.platform, process.cwd(), cliBinDir);

  program
    .version(config.cli.package.version);

  program
    .command('create [directory] [name] [id]')
    .description('Creates a new Capacitor project')
    .option('--npm-client [npmClient]', 'Optional: npm client to use for dependency installation')
    .action((directory, name, id, { npmClient }) => {
      return createCommand(config, directory, name, id, npmClient);
    });

  program
    .command('init [appName] [appId]')
    .description('Initializes a new Capacitor project in the current directory')
    .option('--web-dir [value]', 'Optional: Directory of your projects built web assets', config.app.webDir ? config.app.webDir : 'www')
    .option('--npm-client [npmClient]', 'Optional: npm client to use for dependency installation')
    .action((appName, appId, { webDir, npmClient }) => {
      return initCommand(config, appName, appId, webDir, npmClient);
    });

  program
    .command('serve')
    .description('Serves a Capacitor Progressive Web App in the browser')
    .action(() => {
      return serveCommand(config);
    });

  program
    .command('sync [platform]')
    .description('copy + update')
    .option('--deployment', 'Optional: if provided, Podfile.lock won\'t be deleted and pod install will use --deployment option')
    .action((platform, { deployment }) => {
      return syncCommand(config, platform, deployment);
    });

  program
    .command('update [platform]')
    .description(`updates the native plugins and dependencies based in package.json`)
    .option('--deployment', 'Optional: if provided, Podfile.lock won\'t be deleted and pod install will use --deployment option')
    .action((platform, { deployment }) => {
      return updateCommand(config, platform, deployment);
    });

  program
    .command('copy [platform]')
    .description('copies the web app build into the native app')
    .action(platform => {
      return copyCommand(config, platform);
    });

  program
    .command('open [platform]')
    .description('opens the native project workspace (xcode for iOS)')
    .action(platform => {
      return openCommand(config, platform);
    });

  program
    .command('add [platform]')
    .description('add a native platform project')
    .action((platform) => {
      return addCommand(config, platform);
    });

  program
    .command('ls [platform]')
    .description('list installed Cordova and Capacitor plugins')
    .action(platform => {
      return listCommand(config, platform);
    });

  program
    .command('doctor [platform]')
    .description('checks the current setup for common errors')
    .action(platform => {
      return doctorCommand(config, platform);
    });

  program
    .command('plugin:generate')
    .description('start a new Capacitor plugin')
    .action(() => {
      return newPluginCommand(config);
    });

  program
    .arguments('<command>')
    .action((cmd) => {
      program.outputHelp();
      console.log(`  ` + chalk.red(`\n  Unknown command ${chalk.yellow(cmd)}.`));
      console.log();
    });

  program.parse(process.argv);

  if (!program.args.length) {
    console.log(`\n  ${_e('⚡️', '--')}  ${chalk.bold('Capacitor - Cross-Platform apps with JavaScript and the Web')}  ${_e('⚡️', '--')}`);
    program.help();
  }
}
