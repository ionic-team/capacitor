import * as program from 'commander';

import { copyCommand } from './commands/copy';
import { updateCommand } from './commands/update';
import { openCommand } from './commands/open';
import { syncCommand } from './commands/sync';
import { createCommand } from './commands/create';
import { newPluginCommand } from './commands/new-plugin';
import { doctorCommand } from './commands/doctor';

export const PROJECT_DIR = __dirname;

export function run(process: NodeJS.Process) {

  program
    .version(require('../package.json').version);

  program
    .command('sync [platform]')
    .description('updates + copy')
    .action(syncCommand);

  program
    .command('update [platform]')
    .description(`updates the native plugins and dependencies based in package.json`)
    .action(updateCommand);

  program
    .command('copy [platform]')
    .description('copies the web app build into the native app')
    .action(copyCommand);

  program
    .command('open [platform]')
    .description('opens the native project workspace (xcode for iOS)')
    .action(openCommand);

  program
    .command('create [platform]')
    .description('create a native project')
    .action(createCommand);

  program
    .command('doctor [platform]')
    .description('checks the current setup for common errors')
    .action(doctorCommand);

  program
    .command('new-plugin')
    .description('start a new avocado plugin')
    .action(newPluginCommand);

  program.parse(process.argv);
  if (!program.args.length) {
    program.help();
  }
}
