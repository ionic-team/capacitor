import { Avocado } from './avocado';
/**
 * Base class for all 3rd party plugins.
 */
export declare class Plugin {
    avocado: Avocado;
    constructor();
    nativeCallback(method: string, data: any, callbackFunction: Function, webFallback?: Function): any;
    nativePromise(method: string, data?: any, webFallback?: Function): any;
    /**
     * Call a native plugin method, or a web API fallback.
     */
    native(method: any, data: any, callbackType: string, callbackFunction: Function, webFallback: Function): any;
}
/**
 * Decorator for AvocadoPlugin's
 */
export declare function AvocadoPlugin(config: any): (cls: any) => any;
