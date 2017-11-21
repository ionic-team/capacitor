import { Plugin } from '../plugin';
export declare class FSPlugin extends Plugin {
    constructor();
    writeFile(file: string, data: string, options?: {
        encoding: string;
    }): any;
    readFile(file: string, options?: {
        encoding: string;
    }): any;
}
