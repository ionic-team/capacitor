// Type Definitions
export type {
  CapacitorGlobal,
  PermissionState,
  Plugin,
  PluginCallback,
  PluginImplementations,
  PluginListenerHandle,
  PluginResultData,
  PluginResultError,
} from './definitions';

// Platforms Map
export { CapacitorPlatforms, addPlatform, setPlatform } from './platforms';

// Global APIs
export { Capacitor, registerPlugin } from './global';

// Base WebPlugin
export { WebPlugin, WebPluginConfig, ListenerCallback } from './web-plugin';

// Core Plugins APIs
export { CapacitorCookies, WebView } from './core-plugins';

// Core Plugin definitions
export type {
  ClearCookieOptions,
  DeleteCookieOptions,
  SetCookieOptions,
  WebViewPath,
  WebViewPlugin
} from './core-plugins';

// Original definitions for cookies / http
declare global {
  interface Window {
    CapacitorCookiesAndroidInterface: any;
    CapacitorCookiesDescriptor: PropertyDescriptor;
  }
}

// Constants
export { CapacitorException, ExceptionCode } from './util';

// Legacy Global APIs
export { Plugins, registerWebPlugin } from './global';

// Legacy Type Definitions
export type {
  CallbackID,
  CancellableCallback,
  ISODateString,
  PluginConfig,
  PluginRegistry,
} from './legacy/legacy-definitions';
