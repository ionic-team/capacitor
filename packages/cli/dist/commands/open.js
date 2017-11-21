"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
const path_1 = require("path");
const common_1 = require("../common");
function open(files) {
    const platform = files.shift();
    console.log(files);
    const platformFolders = shelljs_1.ls(platform);
    const first = platformFolders[0];
    if (!first) {
        return 1;
    }
    const dest = path_1.join(platform, first);
    if (platform == 'ios') {
        common_1.log('ls');
        const proj = shelljs_1.ls(dest).filter(f => f.indexOf('.xcodeproj') >= 0)[0];
        if (!proj) {
            common_1.logError('open', 'Unable to find Xcode project');
            return 1;
        }
        const fullPath = path_1.join(dest, proj);
        common_1.log('open', fullPath);
        shelljs_1.exec(`open ${fullPath}`);
    }
}
exports.open = open;
