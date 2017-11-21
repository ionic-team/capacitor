"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require("minimist");
const copy_1 = require("./commands/copy");
const build_1 = require("./commands/build");
const compile_1 = require("./commands/compile");
const install_1 = require("./commands/install");
const open_1 = require("./commands/open");
function main() {
    const args = minimist(process.argv.slice(2));
    const command = args._[0];
    const commandArgs = args._.slice(1);
    switch (command) {
        case 'copy':
            return copy_1.copy(commandArgs);
        case 'build':
            return build_1.build(commandArgs);
        case 'compile':
            return compile_1.compile(commandArgs);
        case 'open':
            return open_1.open(commandArgs);
        case 'install':
            return install_1.install(commandArgs);
    }
}
main();
