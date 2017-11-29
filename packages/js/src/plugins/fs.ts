import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Filesystem',
  id: 'com.avocadojs.plugin.fs'
})
export class Filesystem extends Plugin {

  writeFile(file: string, data: string, directory: FilesystemDirectory, encoding: string = 'utf8') {
    return this.nativePromise('writeFile', {
      file,
      data,
      directory,
      encoding
    });
  }

  appendFile(file: string, data: string, directory: FilesystemDirectory, encoding: string = 'utf8') {
    return this.nativePromise('appendFile', {
      file,
      data,
      directory,
      encoding
    });
  }

  readFile(file: string, directory: FilesystemDirectory, encoding: string = 'utf8') {
    return this.nativePromise('readFile', {
      file,
      directory,
      encoding
    });
  }

  mkdir(path: string, directory: FilesystemDirectory, createIntermediateDirectories: boolean = false) {
    return this.nativePromise('mkdir', {
      path,
      directory,
      createIntermediateDirectories
    });
  }

  rmdir(path: string, directory: FilesystemDirectory) {
    return this.nativePromise('rmdir', {
      path,
      directory
    });
  }

  readdir(path: string, directory: FilesystemDirectory) {
    return this.nativePromise('readdir', {
      path,
      directory
    });
  }

  stat(path: string, directory: FilesystemDirectory) {
    return this.nativePromise('stat', {
      path,
      directory
    });
  }

}


export enum FilesystemDirectory {
  Application = 'APPLICATION',
  Documents = 'DOCUMENTS',
  Data = 'DATA',
  Cache = 'CACHE',
  External = 'EXTERNAL', // Android only
  ExternalStorage = 'EXTERNAL_STORAGE' // Android only
}
