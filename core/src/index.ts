// Type Definitions
export type {
  CapacitorGlobal,
  PermissionResult,
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
  SystemBarType,
  SystemBarsStyle,
  SystemBarsAnimation,
  CapacitorCookies,
  CapacitorHttp,
  LocalNetwork,
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
  LocalNetworkPlugin,
  WebViewPath,
  WebViewPlugin,
  SystemBarsVisibilityOptions,
  SystemBarsStyleOptions,
} from './core-plugins';

// Constants
export { CapacitorException, ExceptionCode } from './util';
