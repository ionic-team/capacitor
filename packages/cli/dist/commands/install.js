"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
const utils_1 = require("../utils");
function install(args) {
    utils_1.log('npm install');
    shelljs_1.exec('npm install');
    utils_1.log('npm install');
}
exports.install = install;
