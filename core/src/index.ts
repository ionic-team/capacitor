// Type Definitions
export type {
  Plugin,
  PluginCallback,
  PluginConfig,
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
export { ExceptionCode, NativePlugin } from './util';

// Legcay Global APIs
export { Plugins, mergeWebPlugin, registerWebPlugin } from './global';

// Legacy Type Definitions
export type {
  CallbackID,
  CancellableCallback,
  ISODateString,
  PluginRegistry,
} from './legacy/legacy-definitions';
