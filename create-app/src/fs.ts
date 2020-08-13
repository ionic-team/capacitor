import fs from 'fs';
import util from 'util';

export const mkdir = util.promisify(fs.mkdir);
export const access = util.promisify(fs.access);

export const exists = async (p: string) => {
  try {
    await access(p);
  } catch (e) {
    return false;
  }

  return true;
};
