import * as program from 'commander';
import chalk from 'chalk';

import { createCommand } from './tasks/create';
import { initCommand } from './tasks/init';
import { copyCommand } from './tasks/copy';
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
    .command('create [directory] [name] [id] [npmClient]')
    .description('Creates a new Capacitor project')
    .action((directory, name, id, npmClient) => {
      return createCommand(config, directory, name, id, npmClient);
    });

  program
    .command('init [appName] [appId]')
    .description('Initializes a new Capacitor project in the current directory')
    .option('--npm-client <npmClient>', 'npm client to use for dependency installation')
    .option('--web-dir [value]', 'Optional: Directory of your projects built web assets', 'www')
    .action((appName, appId, { npmClient, webDir }) => {
      if (npmClient) config.cli.npmClient = npmClient;
      return initCommand(config, appName, appId, webDir);
    });

  program
    .command('serve')
    .description('Serves a Capacitor Progressive Web App in the browser')
    .action(() => {
      return serveCommand(config);
    });

  program
    .command('sync [platform]')
    .description('updates + copy')
    .action(platform => {
      return syncCommand(config, platform);
    });

  program
    .command('update [platform]')
    .description(`updates the native plugins and dependencies based in package.json`)
    .action(platform => {
      return updateCommand(config, platform);
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
    .option('--npm-client <npmClient>', 'npm client to use for dependency installation')
    .action((platform, { npmClient }) => {
      if (npmClient) config.cli.npmClient = npmClient;
      return addCommand(config, platform);
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
