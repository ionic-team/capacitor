import * as fs from 'fs-extra';
import * as util from 'util';

export const existsSync = (path: string) => {
  return fs.existsSync(path);
};

export const mkdir = util.promisify(fs.mkdir);
export const cp = util.promisify(fs.copy);