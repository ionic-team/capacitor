import { Avocado } from './avocado';
import { PluginCallback, PluginCallOptions } from './definitions';
/**
 * Base class for all 3rd party plugins.
 */
export declare class Plugin {
    avocado: Avocado;
    constructor();
    nativeCallback(method: string, options?: any, callbackFunction?: PluginCallback, callOptions?: PluginCallOptions): any;
    nativePromise(method: string, options?: any, callOptions?: PluginCallOptions): any;
    /**
     * Call a native plugin method, or a web API fallback.
     *
     * NO CONSOLE LOGS IN THIS METHOD! Can throw our
     * custom console handler into an infinite loop
     */
    native(method: any, options: any, callbackType: string, callbackFunction?: PluginCallback, callOptions?: PluginCallOptions): any;
}
/**
 * Decorator for AvocadoPlugin's
 */
export declare function AvocadoPlugin(config: any): (cls: any) => any;
