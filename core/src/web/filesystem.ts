import { WebPlugin } from './index';

import {
  FileReadOptions,
  FileReadResult,
  FileWriteOptions,
  FileWriteResult,
  FileAppendOptions,
  FileAppendResult,
  FileDeleteOptions,
  FileDeleteResult,
  MkdirOptions,
  MkdirResult,
  RmdirOptions,
  RmdirResult,
  ReaddirOptions,
  ReaddirResult,
  GetUriOptions,
  GetUriResult,
  StatOptions,
  StatResult,
    FilesystemDirectory,
    FilesystemPlugin
} from '../core-plugin-definitions';

export class FilesystemPluginWeb extends WebPlugin implements FilesystemPlugin  {
  GRANTED_MBS = 100;
  DEFAULT_DIRECTORY = FilesystemDirectory.Data;

  // Private vars
  private _temporary: FileSystem;
  private _persistent: FileSystem;


  constructor() {
    super({
      name: 'Filesystem',
      platforms: ['web']
    });
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  }

  static async errorHandler(error: DOMException): Promise<never> {
    return Promise.reject(error);
  }

  static validateParam(fn: string, options: any, key: any): Promise<void> {
    if (options === undefined) {
      throw new ValidationError(`${fn}: Function call has no options.`);
    }

    switch (options[key]) {
      case undefined:
        throw new ValidationError(`${fn}: Option ${key} must have a valid value.`);
    }
    return Promise.resolve();
  }

  private static getEntryPath(uriPath: string): string {
    let cleanedUriPath = uriPath !== undefined ? uriPath.replace(/^[/]+|[/]+$/g, '') : '';
    if (cleanedUriPath.startsWith('filesystem')) {
      cleanedUriPath = cleanedUriPath.split('/').slice(4).join('/');
    }
    return cleanedUriPath;
  }

  async initCacheFs(): Promise<void> {
    if (this._temporary !== undefined) {
      return;
    }
    if (!window.requestFileSystem) {
      throw new Error('Filesystem plugin is only supported by Chrome.');
    }
    return new Promise<FileSystem>((resolve, reject) => {
      window.requestFileSystem(window.TEMPORARY, this.GRANTED_MBS * 1024 * 1024, resolve, reject);
    }).then((fs: FileSystem) => {
      this._temporary = fs;
    });
  }

  private async initDataFs(): Promise<void> {
    if (this._persistent !== undefined) {
      return;
    }
    if (!window.requestFileSystem) {
      throw new Error('Filesystem plugin is only supported by Chrome.');
    }
    return new Promise<FileSystem>((resolve, reject) => {
      window.webkitRequestFileSystem(window.PERSISTENT, this.GRANTED_MBS * 1024 * 1024, resolve, reject);
    }).then((fs: FileSystem) => {
      this._persistent = fs;
    });
  }

  private async getFsRoot(directory: FilesystemDirectory|undefined, path: string|undefined): Promise<DirectoryEntry> {
    directory = directory || this.DEFAULT_DIRECTORY;
    if (path.startsWith('filesystem')) {
      const filestorage: string = path.split('/')[3];
      if (filestorage === 'temporary') {
        directory = FilesystemDirectory.Cache;
      } else if (filestorage === 'persistent') {
        directory = FilesystemDirectory.Data;
      }
    }

    switch (directory) {
      case FilesystemDirectory.Cache:
        await this.initCacheFs();
        return Promise.resolve(this._temporary.root);
      case FilesystemDirectory.Data:
        await this.initDataFs();
        return Promise.resolve(this._persistent.root);

      case FilesystemDirectory.Application:
      case FilesystemDirectory.Documents:
      case FilesystemDirectory.External:
      case FilesystemDirectory.ExternalStorage:
      default:
        await this.initDataFs();
        return Promise.resolve(this._persistent.root);
    }
  }

  async clear(options: any): Promise<void> {
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);

    return new Promise<DirectoryEntry>((resolve, reject) => {
      basedir.getDirectory(path, {}, resolve, reject);
    }).then((directory: DirectoryEntry) => {
      return new Promise<Entry[]>((resolve, reject) => {
        const reader: DirectoryReader = directory.createReader();
        reader.readEntries(resolve, reject);
      }).then((entries: Entry[]) => {
        const promises: Promise<void>[] = entries.map((entry: Entry) => {
          return new Promise<void>((resolve, reject) => {
            if (entry.isDirectory) {
              (<DirectoryEntry>entry).removeRecursively(resolve, reject);
            } else {
              entry.remove(resolve, reject);
            }
          });
        });
        return Promise.all(promises);
      }).then(() => {
        return Promise.resolve();
      });
    });
  }

  /**
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  async readFile(options: FileReadOptions): Promise<FileReadResult> {
    FilesystemPluginWeb.validateParam('readFile', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);
    // const encoding = options.encoding;

    return new Promise<FileEntry>((resolve, reject) => {
      basedir.getFile(path, {}, resolve, reject);
    }).then((fileEntry: FileEntry) => {
      return new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });
    }).then((file: File) => {
      return new Promise<FileReader>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onerror = reject;
        fileReader.onloadend = () => {resolve(fileReader); };
        fileReader.readAsText(file);
      });
    }).then((fileReader: FileReader) => {
      const content =  <string> fileReader.result;
      return Promise.resolve({data: content});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Write a file to disk in the specified location on device
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  async writeFile(options: FileWriteOptions): Promise<FileWriteResult> {
    FilesystemPluginWeb.validateParam('writeFile', options, 'path');
    FilesystemPluginWeb.validateParam('writeFile', options, 'data');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);
    const data = options.data;
    // const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    return new Promise<DirectoryEntry>((resolve, reject) => {
      basedir.getDirectory(parentPath, {}, resolve, reject);
    }).catch((error: DOMException) => {
      if (error.code !== DOMException.NOT_FOUND_ERR) {
        throw(error);
      }
      return this.mkdir({path: parentPath, directory: options.directory, createIntermediateDirectories: true});
    }).then(() => {
      return new Promise<FileEntry>((resolve, reject) => {
        basedir.getFile(path, {create: true}, resolve, reject);
      });
    }).then((file: FileEntry) => {
      return new Promise<FileWriter>((resolve, reject) => {
        file.createWriter(resolve, reject);
      });
    }).then((fileWriter: FileWriter) => {
      return new Promise<ProgressEvent>((resolve, reject) => {
        const blob: Blob = new Blob([data]);
        fileWriter.onerror = reject;
        fileWriter.onwriteend = resolve;
        fileWriter.write(blob);
      });
    }).then(() => {
      return Promise.resolve({});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Append to a file on disk in the specified location on device
   * @param options options for the file append
   * @return a promise that resolves with the file write result
   */
  async appendFile(options: FileAppendOptions): Promise<FileAppendResult> {
    FilesystemPluginWeb.validateParam('appendFile', options, 'path');
    FilesystemPluginWeb.validateParam('appendFile', options, 'data');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);
    const data = options.data;
    // const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    return new Promise<DirectoryEntry>((resolve, reject) => {
      basedir.getDirectory(parentPath, {}, resolve, reject);
    }).catch((error: DOMException) => {
      if (error.code !== DOMException.NOT_FOUND_ERR) {
        throw(error);
      }
      return this.mkdir({path: parentPath, directory: options.directory, createIntermediateDirectories: true});
    }).then(() => {
      return new Promise<FileEntry>((resolve, reject) => {
        basedir.getFile(path, {create: true}, resolve, reject);
      });
    }).then((file: FileEntry) => {
      return new Promise<FileWriter>((resolve, reject) => {
        file.createWriter(resolve, reject);
      });
    }).then((fileWriter: FileWriter) => {
      fileWriter.seek(fileWriter.length);
      return new Promise<ProgressEvent>((resolve, reject) => {
        const blob: Blob = new Blob([data]);
        fileWriter.onerror = reject;
        fileWriter.onwriteend = resolve;
        fileWriter.write(blob);
      });
    }).then(() => {
      return Promise.resolve({});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Delete a file from disk
   * @param options options for the file delete
   * @return a promise that resolves with the deleted file data result
   */
  async deleteFile(options: FileDeleteOptions): Promise<FileDeleteResult> {
    FilesystemPluginWeb.validateParam('deleteFile', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);

    return new Promise<FileEntry>((resolve, reject) => {
      basedir.getFile(path, {}, resolve, reject);
    }).then((file: FileEntry) => {
      return new Promise<void>((resolve, reject) => {
        file.remove(resolve, reject);
      });
    }).then(() => {
      return Promise.resolve({});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Create a directory.
   * @param options options for the mkdir
   * @return a promise that resolves with the mkdir result
   */
  async mkdir(options: MkdirOptions): Promise<MkdirResult> {
    FilesystemPluginWeb.validateParam('mkdir', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);
    const createIntermediateDirectories = options.createIntermediateDirectories;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    /*if (cleanedpath === '') {
      return Promise.resolve({});
    }*/


    if (!createIntermediateDirectories || parentPath === '') {
      return new Promise<DirectoryEntry>((resolve, reject) => {
        basedir.getDirectory(path, {create: true, exclusive: true}, resolve, reject);
      }).then(() => {
        return Promise.resolve({});
      })
        .catch(FilesystemPluginWeb.errorHandler);
    } else {
      return new Promise<DirectoryEntry>((resolve, reject) => {
        basedir.getDirectory(parentPath, {}, resolve, reject);
      }).catch((error: DOMException) => {
        if (error.code !== DOMException.NOT_FOUND_ERR) {
          throw(error);
        }
        return this.mkdir({path: parentPath, directory: options.directory, createIntermediateDirectories: createIntermediateDirectories});
      }).then(() => {
        return new Promise<DirectoryEntry>((resolve, reject) => {
          basedir.getDirectory(path, {create: true, exclusive: true}, resolve, reject);
        });
      }).then(() => {
        return Promise.resolve({});
      })
        .catch(FilesystemPluginWeb.errorHandler);
    }
  }


  /**
   * Remove a directory
   * @param options the options for the directory remove
   */
  async rmdir(options: RmdirOptions): Promise<RmdirResult> {
    FilesystemPluginWeb.validateParam('rmdir', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);

    return new Promise<DirectoryEntry>((resolve, reject) => {
      basedir.getDirectory(path, {}, resolve, reject);
    }).then((directory: DirectoryEntry) => {
      return new Promise<void>((resolve, reject) => {
        directory.remove(resolve, reject);
      });
    }).then(() => {
      return Promise.resolve({});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Return a list of files from the directory (not recursive)
   * @param options the options for the readdir operation
   * @return a promise that resolves with the readdir directory listing result
   */
  async readdir(options: ReaddirOptions): Promise<ReaddirResult> {
    FilesystemPluginWeb.validateParam('readdir', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);

    return new Promise<DirectoryEntry>((resolve, reject) => {
      basedir.getDirectory(path, {}, resolve, reject);
    }).then((directory: DirectoryEntry) => {
      return new Promise<Entry[]>((resolve, reject) => {
        const reader: DirectoryReader = directory.createReader();
        reader.readEntries(resolve, reject);
      });
    }).then((fileEntries: Entry[]) => {
      const files: string[] = fileEntries.map(e => e.name).sort();
      return Promise.resolve({files: files});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Return full File URI for a path and directory
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async getUri(options: GetUriOptions): Promise<GetUriResult> {
    FilesystemPluginWeb.validateParam('getUri', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);

    return new Promise<Entry>((resolve, reject) => {
      basedir.getFile(path, {}, resolve, reject);
    }).catch((error: DOMException) => {
      if (error.code !== DOMException.TYPE_MISMATCH_ERR) {
        throw(error);
      }
      return new Promise<Entry>((resolve, reject) => {
        basedir.getDirectory(path, {}, resolve, reject);
      });
    }).then((entry: Entry) => {
      const uri = entry.toURL();
      return Promise.resolve({uri: uri});
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }

  /**
   * Return data about a file
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async stat(options: StatOptions): Promise<StatResult> {
    FilesystemPluginWeb.validateParam('stat', options, 'path');
    const basedir: DirectoryEntry = await this.getFsRoot(options.directory, options.path);
    const path = FilesystemPluginWeb.getEntryPath(options.path);

    return new Promise<Entry>((resolve, reject) => {
      basedir.getFile(path, {}, resolve, reject);
    }).catch((error: DOMException) => {
      if (error.code !== DOMException.TYPE_MISMATCH_ERR) {
        throw(error);
      }
      return new Promise<Entry>((resolve, reject) => {
        basedir.getDirectory(path, {}, resolve, reject);
      });
    }).then((entry: Entry) => {
      return new Promise<Metadata>((resolve, reject) => {
        entry.getMetadata(resolve, reject);
      }).then((meta: Metadata) => {
        const stats = {
          type: entry.isDirectory ? 'directory' : 'file',
          size: meta.size,
          ctime: meta.modificationTime.getTime(),
          mtime: meta.modificationTime.getTime(),
          uri: entry.toURL()
        };
        return Promise.resolve(stats);
      });
    })
      .catch(FilesystemPluginWeb.errorHandler);
  }
}

class ValidationError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

const Filesystem = new FilesystemPluginWeb();

export { Filesystem };
