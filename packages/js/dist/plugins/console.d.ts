import { Plugin } from '../plugin';
export declare class ConsolePlugin extends Plugin {
    queue: any[];
    originalLog: Function;
    constructor();
    windowLog(...args: any[]): void;
}
