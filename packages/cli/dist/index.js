"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const copy_1 = require("./commands/copy");
const build_1 = require("./commands/build");
const compile_1 = require("./commands/compile");
const update_1 = require("./commands/update");
const open_1 = require("./commands/open");
const clean_1 = require("./commands/clean");
const recreate_1 = require("./commands/recreate");
exports.PROJECT_DIR = __dirname;
function run(process) {
    program
        .version('0.0.1');
    program
        .command('update [mode]')
        .option('-f, --force', 'forces a version update')
        .description('updates the native plugins')
        .action(update_1.updateCommand);
    program
        .command('clean')
        .description('WARNING! removes iOS and android folders')
        .action(clean_1.clean);
    program
        .command('recreate [mode]')
        .description('WARNING! removes iOS and android folders')
        .action(recreate_1.recreateCommand);
    program
        .command('copy [mode]')
        .description('copies the content of something')
        .action(copy_1.copyCommand);
    program
        .command('build')
        .description('builds avocado')
        .action(build_1.build);
    program
        .command('compile')
        .description('compiles avocado')
        .action(compile_1.compile);
    program
        .command('open')
        .description('opens avocado')
        .action(open_1.open);
    program.parse(process.argv);
}
exports.run = run;
