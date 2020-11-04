/* eslint-disable */
import type { PluginRegistry } from './legacy/core-plugin-definitions';

export { PluginRegistry };

export interface Plugin {
  addListener(
    eventName: string,
    listenerFunc: (...args: any[]) => any,
  ): PluginListenerHandle;
  removeAllListeners(): void;
  requestPermissions?: () => Promise<PermissionsRequestResult>;
}

export interface PermissionsRequestResult {
  results: any[];
}

export interface PluginListenerHandle {
  remove: () => void;
}

export interface PluginResultData {
  [key: string]: any;
}

export interface PluginResultError {
  message: string;
}

export type PluginCallback = (
  data: PluginResultData,
  error?: PluginResultError,
) => void;

/**
 * Callback data kept on the client
 * to be called after native response
 */
export interface StoredCallback {
  callback?: PluginCallback;
  resolve?: (...args: any[]) => any;
  reject?: (...args: any[]) => any;
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

export interface PluginConfig {
  id: string;
  name: string;
}

export const enum ExceptionCode {
  /**
   * API is not implemented.
   *
   * This usually means the API can't be used because it is not implemented for
   * the current platform.
   */
  Unimplemented = 'UNIMPLEMENTED',

  /**
   * API is not available.
   *
   * This means the API can't be used right now because:
   *   - it is currently missing a prerequisite, such as network connectivity
   *   - it requires a particular platform or browser version
   */
  Unavailable = 'UNAVAILABLE',
}

export interface CapacitorException extends Error {
  code?: ExceptionCode;
}

declare const CapacitorException: {
  prototype: CapacitorException;
  new (message: string, code?: ExceptionCode): CapacitorException;
};

/**
 * Register plugin implementations with Capacitor.
 *
 * This function will create and register an instance that contains the
 * implementations of the plugin.
 *
 * Each plugin has multiple implementations, one per platform. Each
 * implementation must adhere to a common interface to ensure client code
 * behaves consistently across each platform.
 *
 * @param pluginName The unique CamelCase name of this plugin.
 * @param implementations The map of plugin implementations.
 */
export type RegisterPlugin = <T>(
  pluginName: string,
  implementations: Readonly<PluginImplementations>,
) => T;

export interface Capacitor {
  /**
   * Utility function to convert a file path into
   * a useful src depending on the value and environment.
   */
  convertFileSrc: (filePath: string) => string;

  /**
   * The Exception class used when generating plugin Exceptions
   * from bridge calls.
   */
  Exception: typeof CapacitorException;

  /**
   * Boolean if the platform is native or not. `android` and `ios`
   * would return `true`, otherwise `false`.
   */
  isNativePlatform: () => boolean;

  /**
   * Used to check if a platform is registered and available.
   */
  isPluginAvailable: (name: string) => boolean;

  /**
   * Gets the name of the platform, such as `android`, `ios`, or `web`.
   */
  getPlatform: () => string;

  /**
   * Sends data over the bridge to the native layer.
   * Returns the Callback Id.
   */
  nativeCallback?: (
    pluginName: string,
    methodName: string,
    options?: any,
    callback?: PluginCallback,
  ) => string;

  /**
   * Sends data over the bridge to the native layer and
   * resolves the promise when it receives the data from
   * the native implementation.
   */
  nativePromise?: (
    pluginName: string,
    methodName: string,
    options?: any,
  ) => Promise<any>;

  /**
   * Add a listener for a plugin event.
   */
  addListener?: (
    pluginName: string,
    eventName: string,
    callback: PluginCallback,
  ) => PluginListenerHandle;

  /**
   * Remove a listener to a plugin event.
   */
  removeListener?: (
    pluginName: string,
    callbackId: string,
    eventName: string,
    callback: PluginCallback,
  ) => void;

  /**
   * Called when a plugin method is not available. Defaults to console
   * logging a warning.
   * @deprecated
   */
  pluginMethodNoop: (
    target: any,
    key: PropertyKey,
    pluginName: PropertyKey,
  ) => void;

  logToNative: (data: CallData) => void;

  logFromNative: (results: PluginResult) => void;

  handleError: (error: Error) => void;

  handleWindowError: (
    msg: string,
    url: string,
    lineNo: number,
    columnNo: number,
    error: Error,
  ) => void;

  /**
   * Registry of all the plugins.
   */
  Plugins: PluginRegistry;

  registerPlugin: RegisterPlugin;

  getServerUrl: () => void;

  setServerUrl: (url: string) => void;

  uuidv4: () => string;

  DEBUG?: boolean;

  /**
   * @deprecated Use `getPlatform()` instead
   */
  platform?: string;
  /**
   * @deprecated Use `isNativePlatform()` instead
   */
  isNative?: boolean;
}

/**
 * Has all instance properties that are available and used
 * by the native layer. The "Capacitor" interface it extends
 * is the public one.
 */
export interface CapacitorInstance extends Capacitor {
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

  /**
   * Low-level API used by the native bridge.
   */
  withPlugin: (pluginName: string, fn: (...args: any[]) => any) => void;

  /**
   * Low-level API used by the native bridge to log messages.
   */
  logJs: (message: string, level: 'error' | 'warn' | 'info' | 'log') => void;
}

/**
 * A map of plugin implementations.
 *
 * Each key should be the lowercased platform name as recognized by Capacitor,
 * e.g. 'android', 'ios', and 'web'. Each value must be an instance of a plugin
 * implementation for the respective platform.
 */
export type PluginImplementations = {
  [platform: string]:
    | (() => Promise<PlatformImplementation>)
    | PlatformImplementation
    | typeof NativePlugin;
};

export const NativePlugin = Symbol('NativePlugin');

export interface PlatformImplementation {}

export interface InternalState {
  serverUrl: string;
}

export interface GlobalInstance {
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
  cordova?: {
    fireDocumentEvent?: (eventName: string, eventData: any) => void;
  };
  document?: any;
  navigator?: {
    app?: {
      exitApp?: () => void;
    };
  };
  console?: any;
  WEBVIEW_SERVER_URL?: string;
  Ionic?: {
    WebView?: {
      getServerBasePath?: any;
      setServerBasePath?: any;
      persistServerBasePath?: any;
      convertFileSrc?: any;
    };
  };
  dispatchEvent?: any;
  Capacitor?: Capacitor;
}

export interface CallData {
  callbackId: string;
  pluginId: string;
  methodName: string;
  options: any;
}

export type Logger = (
  level: 'debug' | 'error' | 'info' | 'log' | 'trace' | 'warn',
  msg: any,
) => void;
