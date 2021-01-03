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

// Global APIs
export { Capacitor, registerPlugin } from './global';

// Base WebPlugin
export { WebPlugin, WebPluginConfig, ListenerCallback } from './web-plugin';

// Core Plugins APIs
export { WebView } from './core-plugins';

// Core Plugin definitions
export type { WebViewPath, WebViewPlugin } from './core-plugins';

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
