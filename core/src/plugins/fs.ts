import { Plugin } from '../definitions';

export interface FilesystemPlugin extends Plugin {
  /**
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  readFile(options: FileReadOptions): Promise<FileReadResult>;

  /**
   * Write a file to disk in the specified location on device
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  writeFile(options: FileWriteOptions): Promise<FileWriteResult>;

  /**
   * Append to a file on disk in the specified location on device
   * @param options options for the file append
   * @return a promise that resolves with the file write result
   */
  appendFile(options: FileAppendOptions): Promise<FileAppendResult>;

  /**
   * Delete a file from disk
   * @param options options for the file delete
   * @return a promise that resolves with the deleted file data result
   */
  deleteFile(options: FileDeleteOptions): Promise<FileDeleteResult>;

  /**
   * Create a directory.
   * @param options options for the mkdir
   * @return a promise that resolves with the mkdir result
   */
  mkdir(options: MkdirOptions): Promise<MkdirResult>;

  /**
   * Remove a directory
   * @param options the options for the directory remove
   */
  rmdir(options: RmdirOptions): Promise<RmdirResult>;

  /**
   * Return a list of files from the directory (not recursive)
   * @param options the options for the readdir operation
   * @return a promise that resolves with the readdir directory listing result
   */
  readdir(options: ReaddirOptions): Promise<ReaddirResult>;

  /**
   * Return full File URI for a path and directory
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  getUri(options: GetUriOptions): Promise<GetUriResult>;

  /**
   * Return data about a file
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  stat(options: StatOptions): Promise<StatResult>;

  /**
   * Rename a file or directory
   * @param options the options for the rename operation
   * @return a promise that resolves with the rename result
   */
  rename(options: RenameOptions): Promise<RenameResult>;

  /**
   * Copy a file or directory
   * @param options the options for the copy operation
   * @return a promise that resolves with the copy result
   */
  copy(options: CopyOptions): Promise<CopyResult>;
}

export enum FilesystemDirectory {
  /**
   * The Application directory
   */
  Application = 'APPLICATION',
  /**
   * The Documents directory
   */
  Documents = 'DOCUMENTS',
  /**
   * The Downloads directory
   */
  Downloads = 'DOWNLOADS',
  /**
   * The Data directory
   */
  Data = 'DATA',
  /**
   * The Cache directory
   */
  Cache = 'CACHE',
  /**
   * The external directory (Android only)
   */
  External = 'EXTERNAL',
  /**
   * The external storage directory (Android only)
   */
  ExternalStorage = 'EXTERNAL_STORAGE'
}

export enum FilesystemEncoding {
  UTF8 = 'utf8',
  ASCII = 'ascii',
  UTF16 = 'utf16'
}

export interface FileWriteOptions {
  /**
   * The filename to write
   */
  path: string;
  /**
   * The data to write
   */
  data: string;
  /**
   * The FilesystemDirectory to store the file in
   */
  directory?: FilesystemDirectory;
  /**
   * The encoding to write the file in. If not provided, data
   * is written as base64 encoded data.
   *
   * Pass FilesystemEncoding.UTF8 to write data as string
   */
  encoding?: FilesystemEncoding;
  /**
   * Whether to create any missing parent directories.
   * Defaults to false
   */
  recursive?: boolean;
}

export interface FileAppendOptions {
  /**
   * The filename to write
   */
  path: string;
  /**
   * The data to write
   */
  data: string;
  /**
   * The FilesystemDirectory to store the file in
   */
  directory?: FilesystemDirectory;
  /**
   * The encoding to write the file in. If not provided, data
   * is written as base64 encoded data.
   *
   * Pass FilesystemEncoding.UTF8 to write data as string
   */
  encoding?: FilesystemEncoding;
}

export interface FileReadOptions {
  /**
   * The filename to read
   */
  path: string;
  /**
   * The FilesystemDirectory to read the file from
   */
  directory?: FilesystemDirectory;
  /**
   * The encoding to read the file in, if not provided, data
   * is read as binary and returned as base64 encoded data.
   *
   * Pass FilesystemEncoding.UTF8 to read data as string
   */
  encoding?: FilesystemEncoding;
}

export interface FileDeleteOptions {
  /**
   * The filename to delete
   */
  path: string;
  /**
   * The FilesystemDirectory to delete the file from
   */
  directory?: FilesystemDirectory;
}

export interface MkdirOptions {
  /**
   * The path of the new directory
   */
  path: string;
  /**
   * The FilesystemDirectory to make the new directory in
   */
  directory?: FilesystemDirectory;
  /**
   * Whether to create any missing parent directories as well.
   * Defaults to false
   */
  recursive?: boolean;
}

export interface RmdirOptions {
  /**
   * The path of the directory to remove
   */
  path: string;
  /**
   * The FilesystemDirectory to remove the directory from
   */
  directory?: FilesystemDirectory;
  /**
   * Whether to recursively remove the contents of the directory
   * Defaults to false
   */
  recursive?: boolean;
}

export interface ReaddirOptions {
  /**
   * The path of the directory to read
   */
  path: string;
  /**
   * The FilesystemDirectory to list files from
   */
  directory?: FilesystemDirectory;
}

export interface GetUriOptions {
  /**
   * The path of the file to get the URI for
   */
  path: string;
  /**
   * The FilesystemDirectory to get the file under
   */
  directory: FilesystemDirectory;
}

export interface StatOptions {
  /**
   * The path of the file to get data about
   */
  path: string;
  /**
   * The FilesystemDirectory to get the file under
   */
  directory?: FilesystemDirectory;
}

export interface CopyOptions {
  /**
   * The existing file or directory
   */
  from: string;
  /**
   * The destination file or directory
   */
  to: string;
  /**
   * The FilesystemDirectory containing the existing file or directory
   */
  directory?: FilesystemDirectory;
  /**
   * The FilesystemDirectory containing the destination file or directory. If not supplied will use the 'directory'
   * parameter as the destination
   */
  toDirectory?: FilesystemDirectory;
}

export interface RenameOptions extends CopyOptions {}

export interface FileReadResult {
  data: string;
}
export interface FileDeleteResult {
}
export interface FileWriteResult {
  uri: string;
}
export interface FileAppendResult {
}
export interface MkdirResult {
}
export interface RmdirResult {
}
export interface RenameResult {
}
export interface CopyResult {
}
export interface ReaddirResult {
  files: string[];
}
export interface GetUriResult {
  uri: string;
}
export interface StatResult {
  type: string;
  size: number;
  ctime: number;
  mtime: number;
  uri: string;
}
