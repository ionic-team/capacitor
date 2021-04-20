import type { PluginRegistry } from './legacy/legacy-definitions';
import type { CapacitorException } from './util';

export interface CapacitorGlobal {
  /**
   * The Exception class used when generating plugin Exceptions
   * from bridge calls.
   */
  Exception: typeof CapacitorException;

  /**
   * Utility function to convert a file path into a usable src depending
   * on the native WebView implementation value and environment.
   */
  convertFileSrc: (filePath: string) => string;

  /**
   * Gets the name of the platform, such as `android`, `ios`, or `web`.
   */
  getPlatform: () => string;

  /**
   * Boolean if the platform is native or not. `android` and `ios`
   * would return `true`, otherwise `false`.
   */
  isNativePlatform: () => boolean;

  /**
   * Used to check if a platform is registered and available.
   */
  isPluginAvailable: (name: string) => boolean;

  registerPlugin: RegisterPlugin;

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

  DEBUG?: boolean;

  // Deprecated in v3, will be removed from v4

  /**
   * @deprecated Plugins should be imported instead. Deprecated in
   * v3 and Capacitor.Plugins property definition will not be exported in v4.
   */
  Plugins: PluginRegistry;

  /**
   * Called when a plugin method is not available. Defaults to console
   * logging a warning. Provided for backwards compatibility.
   * @deprecated Deprecated in v3, will be removed from v4
   */
  pluginMethodNoop: (
    target: any,
    key: PropertyKey,
    pluginName: string,
  ) => Promise<never>;

  /**
   * @deprecated Use `isNativePlatform()` instead
   */
  isNative?: boolean;

  /**
   * @deprecated Use `getPlatform()` instead
   */
  platform?: string;
}

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
  implementations?: Readonly<PluginImplementations>,
) => T;

/**
 * A map of plugin implementations.
 *
 * Each key should be the lowercased platform name as recognized by Capacitor,
 * e.g. 'android', 'ios', and 'web'. Each value must be an instance of a plugin
 * implementation for the respective platform.
 */
export type PluginImplementations = {
  [platform: string]: (() => Promise<any>) | any;
};

export interface Plugin {
  addListener(
    eventName: string,
    listenerFunc: (...args: any[]) => any,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export type PermissionState =
  | 'prompt'
  | 'prompt-with-rationale'
  | 'granted'
  | 'denied';

export interface PluginListenerHandle {
  remove: () => Promise<void>;
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
