import * as program from 'commander';

import { copyCommand } from './tasks/copy';
import { updateCommand } from './tasks/update';
import { openCommand } from './tasks/open';
import { syncCommand } from './tasks/sync';
import { Config } from './config';
import { createCommand } from './tasks/create';
import { newPluginCommand } from './tasks/new-plugin';
import { doctorCommand } from './tasks/doctor';
import { config as shellConfig } from 'shelljs';


export function run(process: NodeJS.Process, cliBinDir: string) {
  shellConfig.silent = true;
  const config = new Config(process.cwd(), cliBinDir);

  program
    .version(config.cli.package.version);

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
    .command('create [platform]')
    .description('create a native project')
    .action(platform => {
      return createCommand(config, platform);
    });

  program
    .command('doctor [platform]')
    .description('checks the current setup for common errors')
    .action(platform => {
      return doctorCommand(config, platform);
    });

  program
    .command('plugin:generate')
    .description('start a new avocado plugin')
    .action(() => {
      return newPluginCommand(config);
    });

  program.parse(process.argv);

  if (!program.args.length) {
    program.help();
  }
}
