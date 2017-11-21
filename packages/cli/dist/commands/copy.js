"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const shelljs_1 = require("shelljs");
const config_1 = require("../config");
function getRootPath(mode) {
    switch (mode) {
        case 'ios': return config_1.IOS_PATH;
        case 'android': return config_1.ANDROID_PATH;
    }
    throw 'unknown mode' + mode;
}
function copyCommand(mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const finalMode = yield common_1.askMode(mode);
        copy(finalMode);
    });
}
exports.copyCommand = copyCommand;
function copy(mode) {
    return __awaiter(this, void 0, void 0, function* () {
        common_1.log('copying www folder');
        const modeRoot = getRootPath(mode);
        const dest = mode + '/';
        shelljs_1.cp('-R', 'www', dest);
    });
}
exports.copy = copy;
