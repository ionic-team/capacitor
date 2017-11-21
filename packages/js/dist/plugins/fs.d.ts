import { Plugin } from '../plugin';
export declare enum Directory {
    Application = "APPLICATION",
    Documents = "DOCUMENTS",
    DocumentsSynced = "DOCUMENTS_SYNCED",
    Data = "DATA",
    DataSynced = "DATA_SYNCED",
    Cache = "CACHE",
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
