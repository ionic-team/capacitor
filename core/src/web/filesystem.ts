import {WebPlugin} from './index';

import {
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
    return '/' + directory + '/' + cleanedUriPath;
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
    // const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    let parentEntry = await this.dbRequest('get', [parentPath]) as EntryObj;
    if (parentEntry === undefined) {
      const subDirIndex = parentPath.indexOf('/', 1);
      if (subDirIndex !== -1) {
        const parentArgPath = parentPath.substr(subDirIndex);
        await this.mkdir({path: parentArgPath, directory: options.directory, createIntermediateDirectories: true})
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
      content: data
    };
    await this.dbRequest('put', [pathObj]);
    return {};
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
    let parentEntry = await this.dbRequest('get', [parentPath]) as EntryObj;
    if (parentEntry === undefined) {
      const parentArgPath = parentPath.substr(parentPath.indexOf('/', 1));
      await this.mkdir({path: parentArgPath, directory: options.directory, createIntermediateDirectories: true})
    }
    let occupiedEntry = await this.dbRequest('get', [path]) as EntryObj;
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
    const createIntermediateDirectories = options.createIntermediateDirectories;
    const parentPath = path.substr(0, path.lastIndexOf('/'));

    let depth = (path.match(/\//g) || []).length;
    let parentEntry = await this.dbRequest('get', [parentPath]) as EntryObj;
    let occupiedEntry = await this.dbRequest('get', [path]) as EntryObj;
    if (depth === 1)
      throw Error('Cannot create Root directory');
    if (occupiedEntry !== undefined)
      throw Error('Current directory does already exist.');
    if (!createIntermediateDirectories && depth !== 2 && parentEntry === undefined)
      throw Error('Parent directory must exist');

    if (createIntermediateDirectories && depth !== 2 && parentEntry === undefined) {
      const parentArgPath = parentPath.substr(parentPath.indexOf('/', 1));
      await this.mkdir({
        path: parentArgPath,
        directory: options.directory,
        createIntermediateDirectories: createIntermediateDirectories
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
    const path: string = this.getPath(options.directory, options.path);

    let entry = await this.dbRequest('get', [path]) as EntryObj;
    if (entry === undefined)
      throw Error('Folder does not exist.');
    let entries = await this.dbIndexRequest('by_folder', 'getAllKeys', [IDBKeyRange.only(path)]);
    if (entries.length !== 0)
      throw Error('Folder is not empty.');

    await this.dbRequest('delete', [path]);
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
    if (entry === undefined)
      throw Error('Folder does not exist.');

    let entries: string[] = await this.dbIndexRequest('by_folder', 'getAllKeys', [IDBKeyRange.only(path)]);
    let names = entries.map((e) => {
      return e.substring(entry.path.length + 1);
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
