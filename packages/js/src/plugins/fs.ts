import { NativePlugin, Plugin } from '../plugin';

export enum FilesystemDirectory {
  Application = 'APPLICATION',
  Documents = 'DOCUMENTS',
  Data = 'DATA',
  Cache = 'CACHE',
  External = 'EXTERNAL', // Android only
  ExternalStorage = 'EXTERNAL_STORAGE' // Android only
}

export interface FileReadResult {
  data: string;
}
export interface FileDeleteResult {
}
export interface FileWriteResult {
}
export interface FileAppendResult {
}
export interface MkdirResult {
}
export interface RmdirResult {
}
export interface ReaddirResult {
  files: string[];
}
export interface StatResult {
  type: string;
  size: number;
  ctime: number;
  mtime: number;
}

@NativePlugin({
  name: 'Filesystem',
  id: 'com.avocadojs.plugin.filesystem'
})
export class Filesystem extends Plugin {

  writeFile(file: string, data: string, directory: FilesystemDirectory, encoding: string = 'utf8') : Promise<FileWriteResult> {
    return this.nativePromise('writeFile', {
      file,
      data,
      directory,
      encoding
    });
  }

  appendFile(file: string, data: string, directory: FilesystemDirectory, encoding: string = 'utf8') : Promise<FileAppendResult> {
    return this.nativePromise('appendFile', {
      file,
      data,
      directory,
      encoding
    });
  }

  readFile(file: string, directory: FilesystemDirectory, encoding: string = 'utf8') : Promise<FileReadResult> {
    return this.nativePromise('readFile', {
      file,
      directory,
      encoding
    });
  }

  deleteFile(file: string, directory: FilesystemDirectory) : Promise<FileDeleteResult> {
    return this.nativePromise('deleteFile', {
      file,
      directory
    });
  }

  mkdir(path: string, directory: FilesystemDirectory, createIntermediateDirectories: boolean = false) : Promise<MkdirResult> {
    return this.nativePromise('mkdir', {
      path,
      directory,
      createIntermediateDirectories
    });
  }

  rmdir(path: string, directory: FilesystemDirectory) : Promise<RmdirResult> {
    return this.nativePromise('rmdir', {
      path,
      directory
    });
  }

  readdir(path: string, directory: FilesystemDirectory) : Promise<ReaddirResult> {
    return this.nativePromise('readdir', {
      path,
      directory
    });
  }

  stat(path: string, directory: FilesystemDirectory) : Promise<StatResult> {
    return this.nativePromise('stat', {
      path,
      directory
    });
  }

}