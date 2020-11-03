export type {
  ExceptionCode,
  PluginCallback,
  PluginConfig,
  PluginImplementations,
  PluginListenerHandle,
  PluginResultData,
  PluginResultError,
} from './definitions';

export type {
  CallbackID,
  CancellableCallback,
  ISODateString,
  PluginRegistry,
  SplashScreenHideOptions,
  SplashScreenShowOptions,
  SplashScreenPlugin,
  WebViewPath,
  WebViewPlugin,
} from './legacy/core-plugin-definitions';

export { NativePlugin } from './plugins';

export { Capacitor, Plugins, registerPlugin } from './global';

export { mergeWebPlugin, registerWebPlugin } from './web/web-plugins';
export { SplashScreen, SplashScreenPluginWeb } from './web/splash-screen';
export { WebPlugin, WebPluginConfig, ListenerCallback } from './web';
