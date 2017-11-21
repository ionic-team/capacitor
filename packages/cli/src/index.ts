import * as program from 'commander';

import { copy } from './commands/copy';
import { build } from './commands/build';
import { compile } from './commands/compile';
import { install } from './commands/install';
import { open } from './commands/open';

program
  .version('0.0.1');

program
  .command('copy')
  .description('copies the content of something')
  .action(copy);

program
  .command('build')
  .description('builds avocado')
  .action(copy);

program
  .command('compile')
  .description('compiles avocado')
  .action(copy);

program
  .command('open')
  .description('opens avocado')
  .action(copy);

program
  .command('install')
  .description('installs plugins')
  .action(copy);

program.parse(process.argv);
