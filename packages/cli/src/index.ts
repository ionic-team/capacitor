import * as program from 'commander';

import { copy } from './commands/copy';
import { build } from './commands/build';
import { compile } from './commands/compile';
import { update } from './commands/update';
import { open } from './commands/open';

export function run(process: any) {

  program
    .version('0.0.1');

  program
    .command('copy')
    .description('copies the content of something')
    .action(copy);

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

  program
    .command('update [mode]')
    .description('updates the native plugins')
    .action(update);

  program.parse(process.argv);
}
