import { statSync, type Stats } from 'fs';
import { readdir } from 'fs/promises';
import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'fs-extra';
import { join } from 'path';

export const convertToUnixPath = (path: string): string => {
  return path.replace(/\\/g, '/');
};

export const deleteFolderRecursive = (directoryPath: any): void => {
  if (existsSync(directoryPath)) {
    readdirSync(directoryPath).forEach((file) => {
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

export interface ReaddirPOptions {
  /**
   * Filter out items from the walk process from the final result.
   *
   * @return `true` to keep, otherwise the item is filtered out
   */
  readonly filter: (item: WalkerItem) => boolean;
}

export interface WalkerItem {
  path: string;
  stats: Stats;
}

export async function readdirp(dir: string, { filter }: ReaddirPOptions): Promise<string[]> {
  const dirContent = await readdir(dir, { recursive: true });
  const dirContentWalker: WalkerItem[] = [];
  const filteredContent: string[] = [];
  dirContent.forEach((element) => {
    const path = join(dir, element);
    const stats = statSync(path);
    dirContentWalker.push({ path, stats });
  });
  dirContentWalker.forEach((element) => {
    if (filter(element)) {
      filteredContent.push(element.path);
    }
  });
  return filteredContent;
}
