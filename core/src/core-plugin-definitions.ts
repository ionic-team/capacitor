/* eslint-disable */
import { Plugin } from './definitions';

export interface PluginRegistry {
  SplashScreen: SplashScreenPlugin;
  WebView: WebViewPlugin;

  [pluginName: string]: {
    [prop: string]: any;
  };
}

export type ISODateString = string;
export type CallbackID = string;

/**
 * CancellableCallback is a simple wrapper that a method will
 * return to make it easy to cancel any repeated callback the method
 * might have set up. For example: a geolocation watch.
 */
export interface CancellableCallback {
  /**
   * The cancel function for this method
   */
  cancel: Function;
}

//

export interface SplashScreenPlugin extends Plugin {
  /**
   * Show the splash screen
   */
  show(options?: SplashScreenShowOptions, callback?: Function): Promise<void>;
  /**
   * Hide the splash screen
   */
  hide(options?: SplashScreenHideOptions, callback?: Function): Promise<void>;
}

export interface SplashScreenShowOptions {
  /**
   * Whether to auto hide the splash after showDuration
   */
  autoHide?: boolean;
  /**
   * How long (in ms) to fade in. Default is 200ms
   */
  fadeInDuration?: number;
  /**
   * How long (in ms) to fade out. Default is 200ms
   */
  fadeOutDuration?: number;
  /**
   * How long to show the splash screen when autoHide is enabled (in ms)
   * Default is 3000ms
   */
  showDuration?: number;
}

export interface SplashScreenHideOptions {
  /**
   * How long (in ms) to fade out. Default is 200ms
   */
  fadeOutDuration?: number;
}

//

export interface WebViewPlugin extends Plugin {
  setServerBasePath(options: WebViewPath): Promise<void>;
  getServerBasePath(): Promise<WebViewPath>;
  persistServerBasePath(): Promise<void>;
}

export interface WebViewPath {
  path: string;
}
