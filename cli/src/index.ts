import * as program from 'commander';

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

import { compareIdentifiers } from 'semver';

export function run(process: NodeJS.Process, cliBinDir: string) {
  const config = new Config(process.platform, process.cwd(), cliBinDir);

  program
    .version(config.cli.package.version);

  program
    .command('init')
    .description('Initializes a new Capacitor project in the current directory')
    .action(() => {
      return initCommand(config);
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
    .command('add [platforms]')
    .description('add native platform projects')
    .action(platform => {
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

  program.parse(process.argv);

  if (!program.args.length) {
    const chalk = require('chalk');
    console.log(`\n  ${_e('⚡️', '--')}  ${chalk.bold('Capacitor - Cross-Platform apps with JavaScript and the Web')}  ${_e('⚡️', '--')}`);
    program.help();
  }
}
