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
export { WebPlugin, ListenerCallback } from './web-plugin';

// Core Plugins APIs
export { CapacitorCookies, CapacitorHttp, WebView, buildRequestInit } from './core-plugins';

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
} from './core-plugins';

// Constants
export { CapacitorException, ExceptionCode } from './util';
