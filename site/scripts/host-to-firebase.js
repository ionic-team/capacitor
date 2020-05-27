"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const readFile = util_1.promisify(fs_1.default.readFile);
const writeFile = util_1.promisify(fs_1.default.writeFile);
const HOSTCONFIG_SRC = './www/host.config.json';
const FIREBASE_SRC = './firebase-base.json';
const FIREBASE_DEST = './firebase.json';
(async function () {
    const hostDataSrc = await readFile(HOSTCONFIG_SRC, 'utf-8');
    const hostData = JSON.parse(hostDataSrc);
    const firebaseDataSrc = await readFile(FIREBASE_SRC, 'utf-8');
    const firebaseData = JSON.parse(firebaseDataSrc);
    const headerData = hostData.hosting.rules;
    const fireBaseHeaders = headerData.map(entry => {
        const headers = entry.headers.map(header => ({
            "key": header.name,
            "value": header.value
        }));
        return {
            source: entry.include,
            headers
        };
    });
    const finalData = {
        hosting: Object.assign(Object.assign({}, firebaseData.hosting), { headers: fireBaseHeaders })
    };
    await writeFile(FIREBASE_DEST, JSON.stringify(finalData, null, 2), { encoding: 'utf8' });
})();
