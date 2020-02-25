import {WebPlugin} from './index';

import {
  CopyOptions,
  CopyResult,
  FileAppendOptions,
  FileAppendResult,
  FileDeleteOptions,
  FileDeleteResult,
  FileReadOptions,
  FileReadResult,
  FilesystemDirectory,
  FilesystemPlugin,
  FileWriteOptions,
  FileWriteResult,
  GetUriOptions,
  GetUriResult,
  MkdirOptions,
  MkdirResult,
  ReaddirOptions,
  ReaddirResult,
  RenameOptions,
  RenameResult,
  RmdirOptions,
  RmdirResult,
  StatOptions,
  StatResult
} from '../core-plugin-definitions';

export class FilesystemPluginWeb extends WebPlugin implements FilesystemPlugin {
  DEFAULT_DIRECTORY = FilesystemDirectory.Data;
  DB_VERSION = 1;
  DB_NAME = 'Disc';

  private _writeCmds: string[] = ['add', 'put', 'delete'];
  private _db: IDBDatabase;
  static _debug: boolean = true;

  constructor() {
    super({
      name: 'Filesystem',
      platforms: ['web']
    });
  }

  async initDb(): Promise<IDBDatabase> {
    if (this._db !== undefined) {
      return this._db;
    }
    if (!('indexedDB' in window)) {
      throw new Error('This browser doesn\'t support IndexedDB');
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = FilesystemPluginWeb.doUpgrade;
      request.onsuccess = () => {
        this._db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn('db blocked');
      };
    });
  }

  static doUpgrade(event: IDBVersionChangeEvent) {
    let eventTarget = event.target as IDBOpenDBRequest;
    const db = eventTarget.result;
    switch (event.oldVersion) {
      case 0:
      case 1:
      default:
        if (db.objectStoreNames.contains('FileStorage')) {
          db.deleteObjectStore('FileStorage');
        }
        let store = db.createObjectStore('FileStorage', {keyPath: 'path'});
        store.createIndex('by_folder', 'folder');
    }
  }

  async dbRequest(cmd: string, args: any[]): Promise<any> {
    const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? 'readwrite' : 'readonly';
    return this.initDb()
      .then((conn: IDBDatabase) => {
        return new Promise<IDBObjectStore>((resolve, reject) => {
          const tx: IDBTransaction = conn.transaction(['FileStorage'], readFlag);
          const store: any = tx.objectStore('FileStorage');
          const req = store[cmd](...args);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      });
  }

  async dbIndexRequest(indexName: string, cmd: string, args: [any]): Promise<any> {
    const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? 'readwrite' : 'readonly';
    return this.initDb()
      .then((conn: IDBDatabase) => {
        return new Promise<IDBObjectStore>((resolve, reject) => {
          const tx: IDBTransaction = conn.transaction(['FileStorage'], readFlag);
          const store: IDBObjectStore = tx.objectStore('FileStorage');
          const index: any = store.index(indexName);
          const req = index[cmd](...args) as any;
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      });
  }

  private getPath(directory: FilesystemDirectory | undefined, uriPath: string | undefined): string {
    directory = directory || this.DEFAULT_DIRECTORY;
    let cleanedUriPath = uriPath !== undefined ? uriPath.replace(/^[/]+|[/]+$/g, '') : '';
    let fsPath = '/' + directory;
    if (uriPath !== '')
      fsPath += '/' + cleanedUriPath;
    return fsPath;
  }

  async clear(): Promise<{}> {
    const conn: IDBDatabase = await this.initDb();
    const tx: IDBTransaction = conn.transaction(['FileStorage'], 'readwrite');
    const store: IDBObjectStore = tx.objectStore('FileStorage');
    store.clear();
    return {};
  }

  /**
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  async readFile(options: FileReadOptions): Promise<FileReadResult> {
    const path: string = this.getPath(options.directory, options.path);
    // const encoding = options.encoding;

    let entry = await this.dbRequest('get', [path]) as EntryObj;
    if (entry === undefined)
      throw Error('File does not exist.');
    return {data: entry.content};
  }

  /**
   * Write a file to disk in the specified location on device
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  async writeFile(options: FileWriteOptions): Promise<FileWriteResult> {
    const path: string = this.getPath(options.directory, options.path);
    const data = options.data;
    const doRecursive = options.recursive;

    let occupiedEntry = await this.dbRequest('get', [path]) as EntryObj;
    if (occupiedEntry && occupiedEntry.type === 'directory')
      throw('The supplied path is a directory.');

    const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    let parentEntry = await this.dbRequest('get', [parentPath]) as EntryObj;
    if (parentEntry === undefined) {
      const subDirIndex = parentPath.indexOf('/', 1);
      if (subDirIndex !== -1) {
        const parentArgPath = parentPath.substr(subDirIndex);
        await this.mkdir({path: parentArgPath, directory: options.directory, recursive: doRecursive});
      }
    }
    const now = Date.now();
    const pathObj: EntryObj = {
      path: path,
      folder: parentPath,
      type: 'file',
      size: data.length,
      ctime: now,
      mtime: now,
      content: !encoding && data.indexOf(',') >= 0 ? data.split(',')[1] : data,
    };
    await this.dbRequest('put', [pathObj]);
    return {
      uri: pathObj.path
    };
  }

  /**
   * Append to a file on disk in the specified location on device
   * @param options options for the file append
   * @return a promise that resolves with the file write result
   */
  async appendFile(options: FileAppendOptions): Promise<FileAppendResult> {
    const path: string = this.getPath(options.directory, options.path);
    let data = options.data;
    // const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    const now = Date.now();
    let ctime = now;

    let occupiedEntry = await this.dbRequest('get', [path]) as EntryObj;
    if (occupiedEntry && occupiedEntry.type === 'directory')
      throw('The supplied path is a directory.');

    let parentEntry = await this.dbRequest('get', [parentPath]) as EntryObj;
    if (parentEntry === undefined) {
      const parentArgPath = parentPath.substr(parentPath.indexOf('/', 1));
      await this.mkdir({path: parentArgPath, directory: options.directory, recursive: true});
    }

    if (occupiedEntry !== undefined) {
      data = occupiedEntry.content + data;
      ctime = occupiedEntry.ctime;
    }
    const pathObj: EntryObj = {
      path: path,
      folder: parentPath,
      type: 'file',
      size: data.length,
      ctime: ctime,
      mtime: now,
      content: data
    };
    await this.dbRequest('put', [pathObj]);
    return {};
  }

  /**
   * Delete a file from disk
   * @param options options for the file delete
   * @return a promise that resolves with the deleted file data result
   */
  async deleteFile(options: FileDeleteOptions): Promise<FileDeleteResult> {
    const path: string = this.getPath(options.directory, options.path);

    let entry = await this.dbRequest('get', [path]) as EntryObj;
    if (entry === undefined)
      throw Error('File does not exist.');
    let entries = await this.dbIndexRequest('by_folder', 'getAllKeys', [IDBKeyRange.only(path)]);
    if (entries.length !== 0)
      throw Error('Folder is not empty.');

    await this.dbRequest('delete', [path]);
    return {};
  }

  /**
   * Create a directory.
   * @param options options for the mkdir
   * @return a promise that resolves with the mkdir result
   */
  async mkdir(options: MkdirOptions): Promise<MkdirResult> {
    const path: string = this.getPath(options.directory, options.path);
    const doRecursive = options.recursive;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    let depth = (path.match(/\//g) || []).length;
    let parentEntry = await this.dbRequest('get', [parentPath]) as EntryObj;
    let occupiedEntry = await this.dbRequest('get', [path]) as EntryObj;
    if (depth === 1)
      throw Error('Cannot create Root directory');
    if (occupiedEntry !== undefined)
      throw Error('Current directory does already exist.');
    if (!doRecursive && depth !== 2 && parentEntry === undefined)
      throw Error('Parent directory must exist');

    if (doRecursive && depth !== 2 && parentEntry === undefined) {
      const parentArgPath = parentPath.substr(parentPath.indexOf('/', 1));
      await this.mkdir({
        path: parentArgPath,
        directory: options.directory,
        recursive: doRecursive
      });
    }
    const now = Date.now();
    const pathObj: EntryObj = {path: path, folder: parentPath, type: 'directory', size: 0, ctime: now, mtime: now};
    await this.dbRequest('put', [pathObj]);
    return {};
  }

  /**
   * Remove a directory
   * @param options the options for the directory remove
   */
  async rmdir(options: RmdirOptions): Promise<RmdirResult> {
    let {path, directory, recursive} = options;
    const fullPath: string = this.getPath(directory, path);

    let entry = await this.dbRequest('get', [fullPath]) as EntryObj;

    if (entry === undefined)
      throw Error('Folder does not exist.');

    if (entry.type !== 'directory')
      throw Error('Requested path is not a directory');

    let readDirResult = await this.readdir({path, directory});

    if (readDirResult.files.length !== 0 && !recursive)
      throw Error('Folder is not empty');

    for (const entry of readDirResult.files) {
      let entryPath = `${path}/${entry}`;
      let entryObj = await this.stat({path: entryPath, directory});
      if (entryObj.type === 'file') {
        await this.deleteFile({path: entryPath, directory});
      } else {
        await this.rmdir({path: entryPath, directory, recursive});
      }
    }

    await this.dbRequest('delete', [fullPath]);
    return {};
  }

  /**
   * Return a list of files from the directory (not recursive)
   * @param options the options for the readdir operation
   * @return a promise that resolves with the readdir directory listing result
   */
  async readdir(options: ReaddirOptions): Promise<ReaddirResult> {
    const path: string = this.getPath(options.directory, options.path);

    let entry = await this.dbRequest('get', [path]) as EntryObj;
    if (options.path !== '' && entry === undefined)
      throw Error('Folder does not exist.');

    let entries: string[] = await this.dbIndexRequest('by_folder', 'getAllKeys', [IDBKeyRange.only(path)]);
    let names = entries.map((e) => {
      return e.substring(path.length + 1);
    });
    return {files: names};
  }

  /**
   * Return full File URI for a path and directory
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async getUri(options: GetUriOptions): Promise<GetUriResult> {
    let path: string = this.getPath(options.directory, options.path);

    let entry = await this.dbRequest('get', [path]) as EntryObj;
    if (entry === undefined) {
      entry = await this.dbRequest('get', [path + '/']) as EntryObj;
    }
    if (entry === undefined)
      throw Error('Entry does not exist.');

    return {
      uri: entry.path
    };
  }

  /**
   * Return data about a file
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async stat(options: StatOptions): Promise<StatResult> {
    let path: string = this.getPath(options.directory, options.path);

    let entry = await this.dbRequest('get', [path]) as EntryObj;
    if (entry === undefined) {
      entry = await this.dbRequest('get', [path + '/']) as EntryObj;
    }
    if (entry === undefined)
      throw Error('Entry does not exist.');

    return {
      type: entry.type,
      size: entry.size,
      ctime: entry.ctime,
      mtime: entry.mtime,
      uri: entry.path
    };
  }

  /**
   * Rename a file or directory
   * @param options the options for the rename operation
   * @return a promise that resolves with the rename result
   */
  async rename(options: RenameOptions): Promise<RenameResult> {
    return this._copy(options, true);
  }

  /**
   * Copy a file or directory
   * @param options the options for the copy operation
   * @return a promise that resolves with the copy result
   */
  async copy(options: CopyOptions): Promise<CopyResult> {
    return this._copy(options, false);
  }

  /**
   * Function that can perform a copy or a rename
   * @param options the options for the rename operation
   * @param doRename whether to perform a rename or copy operation
   * @return a promise that resolves with the result
   */
  private async _copy(options: CopyOptions, doRename: boolean = false): Promise<CopyResult> {
    let {to, from, directory: fromDirectory, toDirectory} = options;

    if (!to || !from) {
      throw Error('Both to and from must be provided');
    }

    // If no "to" directory is provided, use the "from" directory
    if (!toDirectory) {
      toDirectory = fromDirectory;
    }

    let fromPath = this.getPath(fromDirectory, from);
    let toPath = this.getPath(toDirectory, to);

    // Test that the "to" and "from" locations are different
    if (fromPath === toPath) {
      return {};
    }

    if (toPath.startsWith(fromPath)) {
      throw Error('To path cannot contain the from path');
    }

    // Check the state of the "to" location
    let toObj;
    try {
      toObj = await this.stat({
        path: to,
        directory: toDirectory
      });
    } catch (e) {
      // To location does not exist, ensure the directory containing "to" location exists and is a directory
      let toPathComponents = to.split('/');
      toPathComponents.pop();
      let toPath = toPathComponents.join('/');

      // Check the containing directory of the "to" location exists
      if (toPathComponents.length > 0) {
        let toParentDirectory = await this.stat({
          path: toPath,
          directory: toDirectory,
        });

        if (toParentDirectory.type !== 'directory') {
          throw new Error('Parent directory of the to path is a file');
        }
      }
    }

    // Cannot overwrite a directory
    if (toObj && toObj.type === 'directory') {
      throw new Error('Cannot overwrite a directory with a file');
    }

    // Ensure the "from" object exists
    let fromObj = await this.stat({
      path: from,
      directory: fromDirectory,
    });

    // Set the mtime/ctime of the supplied path
    let updateTime = async (path: string, ctime: number, mtime: number) => {
      let fullPath: string = this.getPath(toDirectory, path);
      let entry = await this.dbRequest('get', [fullPath]) as EntryObj;
      entry.ctime = ctime;
      entry.mtime = mtime;
      await this.dbRequest('put', [entry]);
    };

    switch (fromObj.type) {
      // The "from" object is a file
      case 'file':
        // Read the file
        let file = await this.readFile({
          path: from,
          directory: fromDirectory
        });

        // Optionally remove the file
        if (doRename) {
          await this.deleteFile({
            path: from,
            directory: fromDirectory
          });
        }

        // Write the file to the new location
        await this.writeFile({
          path: to,
          directory: toDirectory,
          data: file.data
        });

        // Copy the mtime/ctime of a renamed file
        if (doRename) {
          await updateTime(to, fromObj.ctime, fromObj.mtime);
        }

        // Resolve promise
        return {};

      case 'directory':
        if (toObj) {
          throw Error('Cannot move a directory over an existing object');
        }

        try {
          // Create the to directory
          await this.mkdir({
            path: to,
            directory: toDirectory,
            recursive: false,
          });

          // Copy the mtime/ctime of a renamed directory
          if (doRename) {
            await updateTime(to, fromObj.ctime, fromObj.mtime);
          }
        } catch (e) {
        }

        // Iterate over the contents of the from location
        let contents = (await this.readdir({
          path: from,
          directory: fromDirectory,
        })).files;

        for (let filename of contents) {
          // Move item from the from directory to the to directory
          await this._copy({
            from: `${from}/${filename}`,
            to: `${to}/${filename}`,
            directory: fromDirectory,
            toDirectory,
          }, doRename);
        }

        // Optionally remove the original from directory
        if (doRename) {
          await this.rmdir({
            path: from,
            directory: fromDirectory
          });
        }
    }

    return {};
  }
}

interface EntryObj {
  path: string;
  folder: string;
  type: string;
  size: number;
  ctime: number;
  mtime: number;
  uri?: string;
  content?: string;
}

const Filesystem = new FilesystemPluginWeb();
export {Filesystem};
