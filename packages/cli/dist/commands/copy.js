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
const common_1 = require("../utils/common");
function copy(mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const finalMode = yield common_1.askMode(mode);
        // const platformFolders = ls(platform);
        // const first = platformFolders[0];
        // if(!first) {
        //   return 1;
        // }
        // const dest = join(platform, first, 'www');
        // log('cp', '-R', 'www/*', dest);
        // cp('-R', 'www/*', dest);
    });
}
exports.copy = copy;
