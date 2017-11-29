import {
  PluginCall,
  PluginResult,
  StoredCallback,
  StoredCallbacks
} from './definitions';
import { Console } from './plugins/console';


/**
 * Main class for interacting with the Avocado runtime.
 */
export class Avocado {
  private console: Console;
  private postToNative: (call: PluginCall) => void;

  // Storage of calls for associating w/ native callback later
  private calls: StoredCallbacks = {};
  private callbackIdCount = 0;

  // public properties
  isNative: boolean;
  platform: string;


  constructor() {
    const win: any = window;

    if (win.androidBridge) {
      // android platform
      this.postToNative = (data: any) => {
        win.androidBridge.postMessage(JSON.stringify(data));
      };
      this.isNative = true;
      this.platform = 'android';

    } else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
      // ios platform
      this.postToNative = (data) => {
        (data as any).type = 'message';
        win.webkit.messageHandlers.bridge.postMessage(data);
      };
      this.isNative = true;
      this.platform = 'ios';

    } else {
      // browser platform
      this.isNative = false;
      this.platform = 'browser';
    }

    // Load console plugin first to avoid race conditions
    setTimeout(() => { this.loadCoreModules(); } );
  }

  log(...args: any[]) {
    args.unshift('Avocado: ');
    this.console && this.console.windowLog(args);
  }

  private loadCoreModules() {
    // this.console = new Console();
  }

  /**
   * Send a plugin method call to the native layer.
   *
   * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
   */
  toNative(pluginId: string, methodName: string, options: any, storedCallback: StoredCallback) {
    if (this.isNative) {
      // create a unique id for this callback
      const callbackId = ++this.callbackIdCount + '';

      if (typeof storedCallback.callbackFunction === 'function' || typeof storedCallback.callbackResolve === 'function') {
        // store the call for later lookup
        this.calls[callbackId] = storedCallback;
      }

      // post the call data to native
      this.postToNative({
        callbackId,
        pluginId,
        methodName,
        options: options || {}
      });

    } else {
      console.warn(`browser implementation unavailable for: ${pluginId}`);
    }
  }

  /**
   * Process a response from the native layer.
   */
  fromNative(result: PluginResult) {
    // get the stored call, if it exists
    const storedCall = this.calls[result.callbackId];

    if (storedCall) {
      // looks like we've got a stored call

      if (typeof storedCall.callbackFunction === 'function') {
        // callback
        if (result.success) {
          storedCall.callbackFunction(null, result.data);
        } else {
          storedCall.callbackFunction(result.error, null);
        }

      } else if (typeof storedCall.callbackResolve === 'function') {
        // promise
        if (result.success) {
          storedCall.callbackResolve(result.data);
        } else {
          storedCall.callbackReject(result.error);
        }

        // no need to keep this stored callback
        // around for a one time resolve promise
        delete this.calls[result.callbackId];
      }

    } else if (!result.success && result.error) {
      // no stored callback, but if there was an error let's log it
      console.error(result.error);
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  }

  /**
   * @return the instance of Avocado
   */
  static instance() {
    if ((window as any).avocado) {
      return (window as any).avocado;
    }
    return (window as any).avocado = new Avocado();
  }
}
