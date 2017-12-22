import * as fs from 'fs';
import * as util from 'util';

export const existsSync = (path: string) => {
  return fs.existsSync(path);
};

export const mkdir = util.promisify(fs.mkdir);