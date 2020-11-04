import type { Plugin } from './definitions';
import { registerPlugin } from './global';
import { NativePlugin } from './util';

export interface WebViewPlugin extends Plugin {
  setServerBasePath(options: WebViewPath): Promise<void>;
  getServerBasePath(): Promise<WebViewPath>;
  persistServerBasePath(): Promise<void>;
}

export interface WebViewPath {
  path: string;
}

export const WebView = registerPlugin<WebViewPlugin>('WebView', {
  android: NativePlugin,
  ios: NativePlugin,
});
