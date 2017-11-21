"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function log(...args) {
    console.log('\x1b[32m[avocado]\x1b[0m', ...args);
}
exports.log = log;
function logError(...args) {
    console.error('\x1b[31m[avocado]\x1b[0m', ...args);
}
exports.logError = logError;
