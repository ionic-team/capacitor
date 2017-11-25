import {
  PluginCallback,
  PluginCallbackHandler,
  PluginCaller,
  PluginCall,
  PluginResult,
  StoredPluginCall
} from './definitions';

import { Platform } from './platform';
import { Plugin } from './plugin';

import { Console } from './modules/console';

declare var window: any;

/**
 * Main class for interacting with the Avocado runtime.
 */
export class Avocado {
  platform: Platform;

  console: Console;

  // Storage of calls for associating w/ native callback later
  private calls: { [key: string]: StoredPluginCall } = {}

  private callbackIdCount = 0;

  constructor() {
    // Load console plugin first to avoid race conditions

    this.platform = new Platform();

    setTimeout(() => { this.loadCoreModules(); } )
  }

  private log(...args: any[]) {
    args.unshift('Avocado: ');
    this.console && this.console.windowLog(args);
  }

  loadCoreModules() {
    this.console = new Console();
  }

  registerPlugin(plugin: Plugin) {
    let info = (<any>plugin).constructor.getPluginInfo();
    this.log('Registering plugin', info);
  }

  /**
   * Send a plugin method call to the native layer.
   * 
   * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
   */
  toNative(call: PluginCall, caller: PluginCaller) {
    let ret;

    let callbackId = call.pluginId + ++this.callbackIdCount;

    call.callbackId = callbackId;

    switch(call.callbackType) {
      case undefined:
        ret = this._toNativePromise(call, caller);
      case 'callback':
        if (typeof caller.callbackFunction !== 'function') {
          caller.callbackFunction = () => {}
        }
        ret = this._toNativeCallback(call, caller);
        break;
      case 'promise':
        ret = this._toNativePromise(call, caller);
      case 'observable':
        break;
    }

    //this.log('To native', call);

    // Send this call to the native layer
    window.webkit.messageHandlers.avocado.postMessage({
      type: 'message',
      ...call
    });

    return ret;
  }

  private _toNativeCallback(call: PluginCall, caller: PluginCaller) {
    this._saveCallback(call, caller.callbackFunction);
  }

  private _toNativePromise(call: PluginCall, caller: PluginCaller) {
    let promiseCall: any = {};

    let promise = new Promise((resolve, reject) => {
      promiseCall['$resolve'] = resolve;
      promiseCall['$reject'] = reject;
    });

    promiseCall['$promise'] = promise;

    this._saveCallback(call, promiseCall);

    return promise;
  }

  private _saveCallback(call: PluginCall, callbackHandler: PluginCallbackHandler) {
    call.callbackId = call.callbackId;
    this.calls[call.callbackId] = {
      call,
      callbackHandler
    }
  }

  /**
   * Process a response from the native layer.
   */
  fromNative(result: PluginResult) {
    console.log('From Native', result);

    const storedCall = this.calls[result.callbackId];

    console.log('Stored call', storedCall);

    const { call, callbackHandler } = storedCall;

    this._fromNativeCallback(result, storedCall);
  }

  private _fromNativeCallback(result: PluginResult, storedCall: StoredPluginCall) {
    const { call, callbackHandler } = storedCall;

    switch(storedCall.call.callbackType) {
      case 'promise': {
        if(result.success === false) {
          callbackHandler.$reject(result.error);
        } else {
          callbackHandler.$resolve(result.data);
        }
        break;
      }
      case 'callback': {
        if(typeof callbackHandler == 'function') {
          result.success ? callbackHandler(null, result.data) : callbackHandler(result.error, null);
        }
      }
    }
  }

  /**
   * @return whether or not we're running in a browser sandbox environment
   * with no acces to native functionality (progressive web, desktop browser, etc).
   */
  isBrowser() {
    // TODO: Make this generic
    return !!!(<any>window).webkit;
  }

  /**
   * @return the instance of Avocado
   */
  static instance() {
    if((<any>window).avocado) {
      return (<any>window).avocado;
    }
    return (<any>window).avocado = new Avocado();
  }
}
