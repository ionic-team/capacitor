import { WebPlugin } from '../../../core/src/web/index';
import {
  FileReadOptions, FileReadResult,
  FilesystemPlugin, FileWriteOptions
} from "../../../core/src/core-plugin-definitions";
import {FileWriteResult} from "../../../core/src";

export interface ElectronFileLocations {
  DOCUMENTS: string,
  DRIVE_ROOT: string,
}

export class FilesystemPluginElectron extends WebPlugin implements FilesystemPlugin {

  NodeFS:any = null;
  fileLocations: ElectronFileLocations;

  constructor() {
    super({
      name: 'Filesystem',
      platforms: ['electron']
    });

    let path = require("path");
    let os = require("os");
    if(os.platform == "win32" ) {
      this.fileLocations.DRIVE_ROOT = process.cwd().split(path.sep)[0];
      this.fileLocations.DOCUMENTS = os.homedir() + `\\Documents\\`;
    } else {
      this.fileLocations.DRIVE_ROOT = '/';
      this.fileLocations.DOCUMENTS = os.homedir() + `\\Documents\\`;
    }

    this.NodeFS = require('fs');
  }

  readFile(options: FileReadOptions): Promise<FileReadResult>{
    return new Promise<FileReadResult>((resolve, reject) => {
      if(!this.fileLocations[options.directory])
        reject(`${options.directory} is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.readFile(lookupPath, options.encoding, (err:any, data:any) => {
        if(err)
          reject(err);
        resolve({data});
      });
    });
  }

  writeFile(options: FileWriteOptions): Promise<FileWriteResult> {
    return new Promise((resolve, reject) => {

      this.NodeFS.writeFile(options.path, options.data, options.encoding, (err:any) => {
        if (err)
          reject(err);
        resolve();
      })
    });
  }

  appendFile(options: {path: string, encoding?: string, data: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      let opts = {path: options.path, encoding: 'utf-8', data: options.data};
      if (options.encoding)
        opts.encoding = options.encoding;
      this.NodeFS.appendFile(opts.path, opts.encoding, opts.data, (err:any) => {
        if(err)
          reject(err);
        resolve();
      });
    });
  }

  deleteFile(options: {path: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.NodeFS.unlink(options.path, (err:any) => {
        if(err)
          reject(err);
        resolve();
      });
    });
  }

  mkdir(options: {path: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.NodeFS.mkdir(options.path, (err:any) => {
        if(err)
          reject(err);
        resolve();
      });
    });
  }

  rmdir(options: {path: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.NodeFS.rmdir(options.path, (err:any) => {
        if(err)
          reject(err);
        resolve();
      });
    });
  }

  readdir(options: {path: string, encoding?: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      let opts = {path: options.path, encoding: 'utf-8'};
      this.NodeFS.readdir(opts.path, opts.encoding, (err:any, files: string[]) => {
        if (err)
          reject(err);
        resolve({files});
      })
    });
  }

  stat(options: {path: string}): Promise<{type: string, size: number, ctime: number, mtime: number}> {
    return new Promise((resolve, reject) => {
      this.NodeFS.stat(options.path, (err:any, stats:any) => {
        if(err)
          reject(err);
        resolve({type: 'Not Available', size: stats.size, ctime: stats.ctimeMs, mtime: stats.mtimeMs});
      });
    });
  }

}

const Filesystem = new FilesystemPluginElectron();

export { Filesystem };
