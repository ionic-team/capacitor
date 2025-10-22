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
export { WebPlugin, ListenerCallback } from './web-plugin';

// Core Plugins APIs
export {
  SystemBars,
  SystemBarsInsets,
  SystemBarsStyle,
  SystemBarsAnimation,
  CapacitorCookies,
  CapacitorHttp,
  WebView,
  buildRequestInit,
} from './core-plugins';

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
} from './core-plugins';

// Constants
export { CapacitorException, ExceptionCode } from './util';
