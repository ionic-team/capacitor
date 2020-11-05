/* eslint-disable */

import type { PluginRegistry } from './legacy/legacy-definitions';
import type { ExceptionCode, NativePlugin } from './util';

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

export interface CapacitorGlobal {
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
   * logging a warning. Provided for backwards compatibility.
   * @deprecated Deprecated in v3, will be removed from v4
   */
  pluginMethodNoop: (
    target: any,
    key: PropertyKey,
    pluginName: PropertyKey,
  ) => void;

  handleError: (error: Error) => void;

  handleWindowError: (
    msg: string,
    url: string,
    lineNo: number,
    columnNo: number,
    error: Error,
  ) => void;

  /**
   * @deprecated Plugins should be imported instead. Deprecated in
   * v3 and Capacitor.Plugins property definition will not be exported in v4.
   */
  Plugins: PluginRegistry;

  registerPlugin: RegisterPlugin;

  getServerUrl: () => string;

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
 * A map of plugin implementations.
 *
 * Each key should be the lowercased platform name as recognized by Capacitor,
 * e.g. 'android', 'ios', and 'web'. Each value must be an instance of a plugin
 * implementation for the respective platform.
 */
export type PluginImplementations = {
  [platform: string]: (() => Promise<any>) | any | typeof NativePlugin;
};
