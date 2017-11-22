import * as program from 'commander';

import { copyCommand } from './commands/copy';
import { build } from './commands/build';
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
    .description('updates the native plugins')
    .action(prepareCommand);

  program
    .command('update [platform]')
    .option('-f, --force', 'forces a version update')
    .description('updates the native plugins')
    .action(updateCommand);

  program
    .command('copy [platform]')
    .description('copies the WWW folder into the native app')
    .action(copyCommand);

  program
    .command('open [platform]')
    .description('opens native project')
    .action(openCommand);

  program
    .command('start [platform]')
    .description('starts a native project')
    .action(startCommand);

  program
    .command('build [platform]')
    .description('builds avocado')
    .action(build);

  program.parse(process.argv);
}
