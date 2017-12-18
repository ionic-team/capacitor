declare global {
  export interface PluginRegistry {}
}

export interface Plugin {
  addListener?: (eventName: string, listenerFunc: Function) => PluginListenerHandle;
  removeListener?: (eventName: string, listenerFunc: Function) => void;
}

export interface PluginListenerHandle {
  remove: () => void;
}

//const Plugins: PluginRegistry = {};
//export { Plugins };

export interface PluginResultData {
  [key: string]: any;
}

export interface PluginResultError {
  message: string;
}

export type PluginCallback = (error: PluginResultError, data: PluginResultData) => void;

/**
 * Data sent over to native
 */
export interface PluginCall {
  callbackId: string;
  pluginId: string;
  methodName: string;
  options: any;
}

/**
 * Callback data kept on the client
 * to be called after native response
 */
export interface StoredCallback {
  callback?: PluginCallback;
  resolve?: Function;
  reject?: Function;
}

/**
 * Collection of all the callback data
 */
export interface StoredCallbacks {
  [callbackId: string]: StoredCallback;
}

/**
 * A resulting call back from the native layer.
 */
export interface PluginResult {
  callbackId?: string;
  methodName: string;
  data: PluginResultData;
  success: boolean;
  error?: PluginResultError;
}

export interface PluginConfig {
  id: string;
  name: string;
}

export interface Avocado {
  isNative?: boolean;
  platform?: string;
  toNative?: (pluginId: string, methodName: string, options: any, storedCallback?: StoredCallback) => void;
  fromNative?: (result: PluginResult) => void;
  withPlugin?: (pluginId: string, fn: Function) => void;
  nativeCallback?: (pluginId: string, methodName: string, options?: any, callback?: any) => void;
  nativePromise?: (pluginId: string, methodName: string, options?: any) => Promise<any>;
  handleError?: (error: Error) => void;
  handleWindowError?: (msg: string, url: string, lineNo: number, columnNo: number, error: Error) => void;
  Plugins?: PluginRegistry;
}

export interface WindowAvocado {
  avocado: Avocado;
  androidBridge: {
    postMessage: (data: any) => void;
  };
  webkit: {
    messageHandlers: {
      bridge: {
        postMessage: (data: any) => void;
      };
    };
  };
  console: {
    [level: string]: Function;
  };
  window: any;
}
