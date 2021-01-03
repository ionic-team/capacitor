import * as fs from 'fs';
import * as util from 'util';

export const mkdir = util.promisify(fs.mkdir);
export const readFile = util.promisify(fs.readFile);
export const readJSON = async p => JSON.parse(await readFile(p));
export const writeFile = util.promisify(fs.writeFile);
export const writeJSON = async (p, contents, space = 2) =>
  writeFile(p, JSON.stringify(contents, undefined, space) + '\n');
