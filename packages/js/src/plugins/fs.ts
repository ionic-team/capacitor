import { AvocadoPlugin, Plugin } from '../plugin';

declare var window;

export enum Directory {
  Application = 'APPLICATION',
  Documents = 'DOCUMENTS',
  Data = 'DATA',
  Cache = 'CACHE',
  External = 'EXTERNAL', // Android only
  ExternalStorage = 'EXTERNAL_STORAGE' // Android only
};

@AvocadoPlugin({
  name: 'FS',
  id: 'com.avocadojs.plugin.fs'
})
export class FSPlugin extends Plugin {
  constructor() {
    super();
  }

  writeFile(file: string, data: string, options?: { encoding: string, directory: Directory }) {
    return this.nativePromise('writeFile', {
      directory: options && options.directory || Directory.Documents,
      file,
      data
    });
  }

  readFile(file: string, options?: { encoding: string, directory: Directory }) {
    return this.nativePromise('readFile', {
      directory: options && options.directory || Directory.Documents,
      file
    });
  }
}