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
} from './definitions.js';

// Global APIs
export { Capacitor, registerPlugin } from './global.js';

// Base WebPlugin
export { WebPlugin, type ListenerCallback } from './web-plugin.js';

// Core Plugins APIs
export {
  SystemBars,
  SystemBarType,
  SystemBarsStyle,
  type SystemBarsAnimation,
  CapacitorCookies,
  CapacitorHttp,
  WebView,
  buildRequestInit,
} from './core-plugins.js';

// Core Plugin definitions
export type {
  ClearCookieOptions,
  DeleteCookieOptions,
  SetCookieOptions,
  HttpHeaders,
  HttpOptions,
  HttpParams,
  HttpResponse,
  HttpResponseType,
  WebViewPath,
  WebViewPlugin,
  SystemBarsVisibilityOptions,
  SystemBarsStyleOptions,
} from './core-plugins.js';

// Constants
export { CapacitorException, ExceptionCode } from './util.js';
