import { PluginRegistry } from './core-plugin-definitions';

export interface Plugin {
  addListener(
    eventName: string,
    listenerFunc: (...args: any[]) => any,
  ): PluginListenerHandle;
}

export type PermissionState =
  | 'prompt'
  | 'prompt-with-rationale'
  | 'granted'
  | 'denied';

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
  error: PluginResultError,
  data: PluginResultData,
) => void;

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
  resolve?: (...args: any[]) => any;
  reject?: (...args: any[]) => any;
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

export enum ExceptionCode {
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

export interface Capacitor {
  Exception: typeof CapacitorException;
  isNative?: boolean;
  platform?: string;
  isPluginAvailable: (name: string) => boolean;
  convertFileSrc: (filePath: string) => string;
  getPlatform: () => string;
  toNative?: (
    pluginId: string,
    methodName: string,
    options: any,
    storedCallback?: StoredCallback,
  ) => void;
  fromNative?: (result: PluginResult) => void;
  withPlugin?: (pluginId: string, fn: (...args: any[]) => any) => void;
  nativeCallback?: (
    pluginId: string,
    methodName: string,
    options?: any,
    callback?: any,
  ) => void;
  nativePromise?: (
    pluginId: string,
    methodName: string,
    options?: any,
  ) => Promise<any>;
  handleError?: (error: Error) => void;
  handleWindowError?: (
    msg: string,
    url: string,
    lineNo: number,
    columnNo: number,
    error: Error,
  ) => void;
  Plugins?: PluginRegistry;
}

export interface WindowCapacitor {
  capacitor: Capacitor;
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
    [level: string]: (...args: any[]) => any;
  };
  window: any;
}

export { PluginRegistry };
