import { PluginCaller, PluginCall, PluginResult } from './definitions';
import { Platform } from './platform';
import { Plugin } from './plugin';
import { Console } from './plugins/console';
/**
 * Main class for interacting with the Avocado runtime.
 */
export declare class Avocado {
    platform: Platform;
    console: Console;
    private calls;
    private callbackIdCount;
    constructor();
    private log(...args);
    loadCoreModules(): void;
    registerPlugin(plugin: Plugin): void;
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    toNative(call: PluginCall, caller: PluginCaller): any;
    private _toNativeCallback(call, caller);
    private _toNativePromise(call, caller);
    private _saveCallback(call, callbackHandler);
    /**
     * Process a response from the native layer.
     */
    fromNative(result: PluginResult): void;
    private _fromNativeCallback(result, storedCall);
    /**
     * @return whether or not we're running in a browser sandbox environment
     * with no acces to native functionality (progressive web, desktop browser, etc).
     */
    isBrowser(): boolean;
    /**
     * @return the instance of Avocado
     */
    static instance(): any;
}
