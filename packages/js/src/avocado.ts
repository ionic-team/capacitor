import { Platform } from './platform';
import { Plugin } from './plugin';

declare var window: any;

/**
 * Data that won't be sent to the native layer
 * from the caller. For example, a callback function
 * that cannot be cloned in JS
 */
export interface PluginCaller {
  callbackFunction?: Function;
}

/**
 * Metadata about a native plugin call.
 */
export interface PluginCall {
  pluginId: string;
  methodName: string;
  data: any;

  callbackId?: string;

  callbackFunction?: Function;

  // The type of callback we want
  callbackType?: string;//"callback" | "promise" | "observable";
}

export interface StoredPluginCall {
  call: PluginCall;
  callbackHandler: PluginCallbackHandler;
}

export interface PluginResultError {
  message: string;
}
/**
 * A resulting call back from the native layer.
 */
export interface PluginResult {
  pluginId: string;
  methodName: string;
  data: any;
  callbackId?: string;
  success: boolean;
  error?: PluginResultError;
}

// TODO: Get more complex custom promise type
export type PluginCallbackHandler = Function | any;

/**
 * Main class for interacting with the Avocado runtime.
 */
export class Avocado {
  platform: Platform;

  // Storage of calls for associating w/ native callback later
  private calls: { [key: string]: StoredPluginCall } = {}

  private callbackIdCount = 0;

  constructor() {
    this.log('initializing...');

    this.log('Detecting platform');
    this.platform = new Platform();

    this.loadPlugins();
  }

  private log(...args: any[]) {
    args.unshift('Avocado: ');
    console.log.apply(console, args);
  }

  loadPlugins() {
    this.log('Loading plugins');
  }

  registerPlugin(plugin: Plugin) {
    let info = (<any>plugin).constructor.getPluginInfo();
    this.log('Registering plugin', info);
  }

  /**
   * Send a plugin method call to the native layer.
   */
  toNative(call: PluginCall, caller: PluginCaller) {
    let ret;

    let callbackId = call.pluginId + ++this.callbackIdCount;

    call.callbackId = callbackId;

    switch(call.callbackType) {
      case undefined:
        ret = this._toNativePromise(call, caller);
      case 'callback':
        ret = this._toNativeCallback(call, caller);
        break;
      case 'promise':
        ret = this._toNativePromise(call, caller);
      case 'observable':
        break;
    }

    // Send this call to the native layer
    window.webkit.messageHandlers.avocado.postMessage(call);

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

    const { call, callbackHandler } = storedCall;

    this.log('Found callback', storedCall.callbackHandler);

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
        if(typeof callbackHandler == 'function' && result.success) {
          callbackHandler(result.data);
        } else {
          // TODO: Should pass us an error callback
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
