"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const copy_1 = require("./commands/copy");
const build_1 = require("./commands/build");
const compile_1 = require("./commands/compile");
const update_1 = require("./commands/update");
const open_1 = require("./commands/open");
function run(process) {
    program
        .version('0.0.1');
    program
        .command('copy')
        .description('copies the content of something')
        .action(copy_1.copy);
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
    program
        .command('update [mode]')
        .description('updates the native plugins')
        .action(update_1.update);
    program.parse(process.argv);
}
exports.run = run;
