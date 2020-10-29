export {
  ExceptionCode,
  PluginCallback,
  PluginListenerHandle,
  PluginResultData,
  PluginResultError,
  PluginConfig,
} from './definitions';

export type {
  PluginRegistry,
  ISODateString,
  CallbackID,
  CancellableCallback,
  SplashScreenPlugin,
  SplashScreenShowOptions,
  SplashScreenHideOptions,
  WebViewPlugin,
  WebViewPath,
} from './legacy/core-plugin-definitions';

export { Capacitor, Plugins, registerPlugin } from './global';

export * from './web-plugins';
export * from './web';
