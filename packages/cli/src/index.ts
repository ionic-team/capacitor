import * as program from 'commander';

import { copyCommand } from './commands/copy';
import { build } from './commands/build';
import { compile } from './commands/compile';
import { updateCommand } from './commands/update';
import { open } from './commands/open';
import { clean } from './commands/clean';
import { recreateCommand } from './commands/recreate';

export const PROJECT_DIR = __dirname;

export function run(process: any) {

  program
    .version('0.0.1');

  program
    .command('update [mode]')
    .option('-f, --force', 'forces a version update')
    .description('updates the native plugins')
    .action(updateCommand);

  program
    .command('clean')
    .description('WARNING! removes iOS and android folders')
    .action(clean);

  program
    .command('recreate [mode]')
    .description('WARNING! removes iOS and android folders')
    .action(recreateCommand);

  program
    .command('copy [mode]')
    .description('copies the content of something')
    .action(copyCommand);

  program
    .command('build')
    .description('builds avocado')
    .action(build);

  program
    .command('compile')
    .description('compiles avocado')
    .action(compile);

  program
    .command('open')
    .description('opens avocado')
    .action(open);

  program.parse(process.argv);
}
