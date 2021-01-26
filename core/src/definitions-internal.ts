import type {
  CapacitorGlobal,
  PluginCallback,
  PluginResultData,
  PluginResultError,
} from './definitions';

export interface PluginHeaderMethod {
  readonly name: string;
  readonly rtype?: 'promise' | 'callback';
}

export interface PluginHeader {
  readonly name: string;
  readonly methods: readonly PluginHeaderMethod[];
}

/**
 * Has all instance properties that are available and used
 * by the native layer. The "Capacitor" interface it extends
 * is the public one.
 */
export interface CapacitorInstance extends CapacitorGlobal {
  /**
   * Internal registry for all plugins assigned to the Capacitor global.
   * Legacy Capacitor referenced this property directly, but as of v3
   * it should be an internal API. Still exporting on the Capacitor
   * type, but with the deprecated JSDoc tag.
   */
  Plugins: {
    [pluginName: string]: {
      [prop: string]: any;
    };
  };

  PluginHeaders?: readonly PluginHeader[];

  /**
   * Low-level API to send data to the native layer.
   * Prefer using `nativeCallback()` or `nativePromise()` instead.
   * Returns the Callback Id.
   */
  toNative?: (
    pluginName: string,
    methodName: string,
    options: any,
    storedCallback?: StoredCallback,
  ) => string;

  /**
   * Low-level API used by the native layers to send
   * data back to the webview runtime.
   */
  fromNative?: (result: PluginResult) => void;

  /**
   * Low-level API for backwards compatibility.
   */
  createEvent?: (eventName: string, eventData?: any) => Event;

  /**
   * Low-level API triggered from native implementations.
   */
  triggerEvent?: (
    eventName: string,
    target: string,
    eventData?: any,
  ) => boolean;

  handleError: (err: Error) => void;

  handleWindowError: (
    msg: string,
    url: string,
    lineNo: number,
    columnNo: number,
    err: Error,
  ) => void;

  /**
   * Low-level API used by the native bridge to log messages.
   */
  logJs: (message: string, level: 'error' | 'warn' | 'info' | 'log') => void;

  logToNative: (data: CallData) => void;

  logFromNative: (results: PluginResult) => void;

  /**
   * Low-level API used by the native bridge.
   */
  withPlugin?: (pluginName: string, fn: (...args: any[]) => any) => void;
}

export interface CallData {
  callbackId: string;
  pluginId: string;
  methodName: string;
  options: any;
}

/**
 * A resulting call back from the native layer.
 */
export interface PluginResult {
  callbackId?: string;
  methodName?: string;
  data: PluginResultData;
  success: boolean;
  error?: PluginResultError;
  pluginId?: string;
  save?: boolean;
}

/**
 * Callback data kept on the client
 * to be called after native response
 */
export interface StoredCallback {
  callback?: PluginCallback;
  resolve?: (...args: any[]) => any;
  reject?: (...args: any[]) => any;
}

export interface WindowCapacitor {
  Capacitor?: CapacitorInstance;
  Ionic?: {
    WebView?: {
      getServerBasePath?: any;
      setServerBasePath?: any;
      persistServerBasePath?: any;
      convertFileSrc?: any;
    };
  };
  WEBVIEW_SERVER_URL?: string;
  androidBridge?: {
    postMessage(data: string): void;
  };
  webkit?: {
    messageHandlers?: {
      bridge: {
        postMessage(data: any): void;
      };
    };
  };
  console?: Console;
  cordova?: {
    fireDocumentEvent?: (eventName: string, eventData: any) => void;
  };
  dispatchEvent?: any;
  document?: any;
  navigator?: {
    app?: {
      exitApp?: () => void;
    };
  };
}
