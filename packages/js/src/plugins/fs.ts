import { AvocadoPlugin, Plugin } from '../plugin';

declare var window;

@AvocadoPlugin({
  name: 'FS',
  id: 'com.avocadojs.plugin.fs'
})
export class FSPlugin extends Plugin {
  constructor() {
    super();
  }

  writeFile(file: string, data: string, options?: { encoding: string }) {
    return this.nativePromise('writeFile', {
      file,
      data
    });
  }

  readFile(file: string, options?: { encoding: string }) {
    return this.nativePromise('readFile', {
      file
    });
  }
}