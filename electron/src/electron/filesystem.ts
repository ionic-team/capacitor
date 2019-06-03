import {
  WebPlugin,
  FileReadOptions, FileReadResult,
  FilesystemPlugin, FileWriteOptions,
  FileWriteResult, FileDeleteResult,
  FileAppendOptions, FileAppendResult,
  FilesystemDirectory,
  ReaddirOptions, ReaddirResult,
  MkdirOptions, MkdirResult, GetUriOptions,
  RmdirOptions, RmdirResult, GetUriResult,
  StatOptions, StatResult,FileDeleteOptions,
} from "@capacitor/core";

export class FilesystemPluginElectron extends WebPlugin implements FilesystemPlugin {

  NodeFS:any = null;
  fileLocations:any = null;

  constructor() {
    super({
      name: 'Filesystem',
      platforms: ['electron']
    });
    this.fileLocations = {DRIVE_ROOT: '', DOCUMENTS: ''};

    let path = require("path");
    let os = require("os");
    if(os.platform == "win32" ) {
      this.fileLocations["DRIVE_ROOT"] = process.cwd().split(path.sep)[0];
    } else {
      this.fileLocations["DRIVE_ROOT"] = '/';
    }
    this.fileLocations[FilesystemDirectory.Documents] = path.join(os.homedir(), `Documents`) + path.sep;

    this.NodeFS = require('fs');
  }

  readFile(options: FileReadOptions): Promise<FileReadResult>{
    return new Promise<FileReadResult>((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.readFile(lookupPath, options.encoding, (err:any, data:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve({data});
      });
    });
  }

  writeFile(options: FileWriteOptions): Promise<FileWriteResult> {
    return new Promise((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.writeFile(lookupPath, options.data, options.encoding, (err:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve();
      })
    });
  }

  appendFile(options: FileAppendOptions): Promise<FileAppendResult> {
    return new Promise((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.appendFile(lookupPath, options.encoding, options.data, (err:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  deleteFile(options: FileDeleteOptions): Promise<FileDeleteResult> {
    return new Promise((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} directory is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.unlink(lookupPath, (err:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  mkdir(options: MkdirOptions): Promise<MkdirResult> {
    return new Promise((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.mkdir(lookupPath, (err:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  // TODO: continue bring to spec.
  rmdir(options: RmdirOptions): Promise<RmdirResult> {
    return new Promise((resolve, reject) => {
      this.NodeFS.rmdir(options.path, (err:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  readdir(options: ReaddirOptions): Promise<ReaddirResult> {
    return new Promise((resolve, reject) => {
      let opts = {path: options.path, encoding: 'utf-8'};
      this.NodeFS.readdir(opts.path, opts.encoding, (err:any, files: string[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({files});
      })
    });
  }

  getUri(options: GetUriOptions): Promise<GetUriResult> {
    return new Promise((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} directory is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      resolve({uri: lookupPath});
    });
  };

  stat(options: StatOptions): Promise<StatResult> {
    return new Promise((resolve, reject) => {
      if(Object.keys(this.fileLocations).indexOf(options.directory) === -1)
        reject(`${options.directory} is currently not supported in the Electron implementation.`);
      let lookupPath = this.fileLocations[options.directory] + options.path;
      this.NodeFS.stat(options.path, (err:any, stats:any) => {
        if(err) {
          reject(err);
          return;
        }

        resolve({type: 'Not Available', size: stats.size, ctime: stats.ctimeMs, mtime: stats.mtimeMs, uri: lookupPath});
      });
    });
  }

}

const Filesystem = new FilesystemPluginElectron();

export { Filesystem };
