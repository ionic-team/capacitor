import type { Plugin } from './definitions';
import { registerPlugin } from './global';

export interface WebViewPlugin extends Plugin {
  setServerBasePath(options: WebViewPath): Promise<void>;
  getServerBasePath(): Promise<WebViewPath>;
  persistServerBasePath(): Promise<void>;
}

export interface WebViewPath {
  path: string;
}

export const WebView = /*#__PURE__*/ registerPlugin<WebViewPlugin>('WebView');
