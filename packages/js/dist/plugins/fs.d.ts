import { Plugin } from '../plugin';
export declare enum Directory {
    Application = "APPLICATION",
    Documents = "DOCUMENTS",
    Data = "DATA",
    Cache = "CACHE",
    External = "EXTERNAL",
    ExternalStorage = "EXTERNAL_STORAGE",
}
export declare class FSPlugin extends Plugin {
    constructor();
    writeFile(file: string, data: string, options?: {
        encoding: string;
        directory: Directory;
    }): any;
    readFile(file: string, options?: {
        encoding: string;
        directory: Directory;
    }): any;
}
