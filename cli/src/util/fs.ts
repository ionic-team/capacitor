import {
  existsSync,
  lstatSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from '@ionic/utils-fs';
import { join } from 'path';

export const convertToUnixPath = (path: string): string => {
  return path.replace(/\\/g, '/');
};

export const deleteFolderRecursive = (directoryPath: any): void => {
  if (existsSync(directoryPath)) {
    readdirSync(directoryPath).forEach(file => {
      const curPath = join(directoryPath, file);
      if (lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(directoryPath);
  }
};
