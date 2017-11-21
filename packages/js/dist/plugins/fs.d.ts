import { Plugin } from '../plugin';
export declare enum FilesystemDirectory {
    Application = "APPLICATION",
    Documents = "DOCUMENTS",
    Data = "DATA",
    Cache = "CACHE",
    External = "EXTERNAL",
    ExternalStorage = "EXTERNAL_STORAGE",
}
export declare class Filesystem extends Plugin {
    constructor();
    writeFile(file: string, data: string, directory: FilesystemDirectory, encoding?: string): any;
    readFile(file: string, directory: FilesystemDirectory, encoding?: string): any;
    mkdir(path: string, directory: FilesystemDirectory, createIntermediateDirectories?: boolean): any;
    rmdir(path: string, directory: FilesystemDirectory): any;
}
