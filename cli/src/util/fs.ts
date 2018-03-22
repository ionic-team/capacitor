import * as fsExtra from 'fs-extra';
import * as fs from 'fs';
import * as util from 'util';

export const existsSync = (path: string) => {
  return fs.existsSync(path);
};

export const mkdirAsync = util.promisify(fs.mkdir);
export const symlinkAsync = util.promisify(fs.symlink);
export const readFileAsync = util.promisify(fs.readFile);
export const writeFileAsync = util.promisify(fs.writeFile);
export const readdirAsync = util.promisify(fs.readdir);
export const statAsync = util.promisify(fs.stat);
export const lstatAsync = util.promisify(fs.lstat);
export const renameAsync = util.promisify(fs.rename);
export const copyAsync = fsExtra.copy;
export const removeAsync = fsExtra.remove;

export const removeSync = fsExtra.removeSync;
export const ensureDirSync = fsExtra.ensureDirSync;
export const copySync = fsExtra.copySync;
export const existsAsync = async (path: string) => {
  try {
    const stat = await statAsync(path);
    return true;
  } catch {
    return false;
  }
};
