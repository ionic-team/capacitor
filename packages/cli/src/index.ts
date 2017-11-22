import * as program from 'commander';

import { copyCommand } from './commands/copy';
import { updateCommand } from './commands/update';
import { open, openCommand } from './commands/open';
import { prepareCommand } from './commands/prepare';
import { startCommand } from './commands/start';

export const PROJECT_DIR = __dirname;

export function run(process: any) {

  program
    .version('0.0.1');

  program
    .command('prepare [platform]')
    .description('updates + copy')
    .action(prepareCommand);

  program
    .command('update [platform]')
    .description(`updates the native plugins and dependencies based in package.json`)
    .action(updateCommand);

  program
    .command('copy [platform]')
    .description('copies the WWW folder into the native app')
    .action(copyCommand);

  program
    .command('open [platform]')
    .description('opens the native project workspace (xcode for iOS)')
    .action(openCommand);

  program
    .command('start [platform]')
    .description('starts a native project')
    .action(startCommand);

  program.parse(process.argv);
}
