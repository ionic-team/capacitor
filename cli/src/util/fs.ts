import * as fsExtra from 'fs-extra';
import * as fs from 'fs';
import * as util from 'util';

export const existsSync = (path: string) => {
  return fs.existsSync(path);
};

export const mkdirAsync = util.promisify(fs.mkdir);
export const cpAsync = util.promisify(fsExtra.copy);
export const symlinkAsync = util.promisify(fs.symlink);
export const readFileAsync = util.promisify(fs.readFile);
export const writeFileAsync = util.promisify(fs.writeFile);
export const existsAsync = util.promisify(fs.exists);
export const readdirAsync = util.promisify(fs.readdir);
export const statAsync = util.promisify(fs.stat);
export const lstatAsync = util.promisify(fs.lstat);
export const removeSync = fsExtra.removeSync;
export const ensureDirSync = fsExtra.ensureDirSync;
export const copySync = fsExtra.copySync;
