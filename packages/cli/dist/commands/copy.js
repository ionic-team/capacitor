"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const shelljs_1 = require("shelljs");
const path_1 = require("path");
function copy(args) {
    const platform = args.shift();
    utils_1.log('copy', platform);
    const platformFolders = shelljs_1.ls(platform);
    const first = platformFolders[0];
    if (!first) {
        return 1;
    }
    const dest = path_1.join(platform, first, 'www');
    utils_1.log('cp', '-R', 'www/*', dest);
    shelljs_1.cp('-R', 'www/*', dest);
}
exports.copy = copy;
