"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
function build(args) {
    shelljs_1.exec('npm run build');
}
exports.build = build;
