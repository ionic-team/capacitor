export type {
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

export { mergeWebPlugin, registerWebPlugin } from './web/web-plugins';
export { SplashScreen, SplashScreenPluginWeb } from './web/splash-screen';
export { WebPlugin, WebPluginConfig, ListenerCallback } from './web';
