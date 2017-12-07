import { NativePlugin, Plugin } from '../plugin';

/**
 * The Filesystem API offers a simple node-like API for managing files and directories.
 * 
 * Mobile devices offer logical separation of directories (such as documents, or app-specific data),
 * and each file operation must supply the FilesystemDirectory to operate in.
 */
@NativePlugin({
  name: 'Filesystem',
  id: 'com.avocadojs.plugin.filesystem'
})
export class Filesystem extends Plugin {

  /**
   * Write a file to disk in the specified location on device
   * @param file the filename to write
   * @param data the data to write
   * @param directory the FilesystemDirectory to store the file in
   * @param encoding the encoding to write the file in (defaults to utf8)
   */
  writeFile(file: string, data: string, directory: FilesystemDirectory, encoding: string = 'utf8') : Promise<FileWriteResult> {
    return this.nativePromise('writeFile', {
      file,
      data,
      directory,
      encoding
    });
  }

  /**
   * Append to a file on disk in the specified location on device
   * @param file the filename to write
   * @param data the data to write
   * @param directory the FilesystemDirectory to store the file in
   * @param encoding the encoding to write the file in (defaults to utf8)
   */
  appendFile(file: string, data: string, directory: FilesystemDirectory, encoding: string = 'utf8') : Promise<FileAppendResult> {
    return this.nativePromise('appendFile', {
      file,
      data,
      directory,
      encoding
    });
  }

  /**
   * Read a file from disk
   * @param file the filename to write
   * @param directory the FilesystemDirectory to store the file in
   * @param encoding the encoding to write the file in (defaults to utf8)
   */
  readFile(file: string, directory: FilesystemDirectory, encoding: string = 'utf8') : Promise<FileReadResult> {
    return this.nativePromise('readFile', {
      file,
      directory,
      encoding
    });
  }

  /**
   * Delete a file from disk
   * @param file the filename to write
   * @param directory the FilesystemDirectory to store the file in
   */
  deleteFile(file: string, directory: FilesystemDirectory) : Promise<FileDeleteResult> {
    return this.nativePromise('deleteFile', {
      file,
      directory
    });
  }

  /**
   * Create a directory.
   * @param path the path of the directory to create
   * @param directory the FilesystemDirectory where the new directory will live under
   * @param createIntermediateDirectories whether to create missing parent directories
   */
  mkdir(path: string, directory: FilesystemDirectory, createIntermediateDirectories: boolean = false) : Promise<MkdirResult> {
    return this.nativePromise('mkdir', {
      path,
      directory,
      createIntermediateDirectories
    });
  }

  /**
   * Remove a directory
   * @param path the path of directory to remove
   * @param directory the FilesystemDirectory to remove the directory under
   */
  rmdir(path: string, directory: FilesystemDirectory) : Promise<RmdirResult> {
    return this.nativePromise('rmdir', {
      path,
      directory
    });
  }

  /**
   * Return a list of files from the directory (not recursive)
   * @param path the directory path to read
   * @param directory the FilesystemDirectory to read the directory under
   */
  readdir(path: string, directory: FilesystemDirectory) : Promise<ReaddirResult> {
    return this.nativePromise('readdir', {
      path,
      directory
    });
  }

  /**
   * Return data about a file
   * @param path the path of the file
   * @param directory the FilesystemDirectory where the file lives
   */
  stat(path: string, directory: FilesystemDirectory) : Promise<StatResult> {
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
