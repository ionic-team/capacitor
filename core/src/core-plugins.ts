import type { Plugin } from './definitions';
import { registerPlugin } from './global';
import { WebPlugin } from './web-plugin';

/******** WEB VIEW PLUGIN ********/
export interface WebViewPlugin extends Plugin {
  setServerBasePath(options: WebViewPath): Promise<void>;
  getServerBasePath(): Promise<WebViewPath>;
  persistServerBasePath(): Promise<void>;
}

export interface WebViewPath {
  path: string;
}

export const WebView = /*#__PURE__*/ registerPlugin<WebViewPlugin>('WebView');
/******** END WEB VIEW PLUGIN ********/

/******** COOKIES PLUGIN ********/
/**
 * Safely web encode a string value (inspired by js-cookie)
 * @param str The string value to encode
 */
const encode = (str: string) =>
  encodeURIComponent(str)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);

export interface CapacitorCookiesPlugin {
  setCookie(options: SetCookieOptions): Promise<void>;
  deleteCookie(options: DeleteCookieOptions): Promise<void>;
  clearCookies(options: ClearCookieOptions): Promise<void>;
  clearAllCookies(): Promise<void>;
}

interface HttpCookie {
  url?: string;
  key: string;
  value: string;
}

interface HttpCookieExtras {
  path?: string;
  expires?: string;
}

export type SetCookieOptions = HttpCookie & HttpCookieExtras;
export type DeleteCookieOptions = Omit<HttpCookie, 'value'>;
export type ClearCookieOptions = Omit<HttpCookie, 'key' | 'value'>;


export class CapacitorCookiesPluginWeb extends WebPlugin implements CapacitorCookiesPlugin {
  async setCookie(options: SetCookieOptions): Promise<void> {
    try {
      // Safely Encoded Key/Value
      const encodedKey = encode(options.key);
      const encodedValue = encode(options.value);

      // Clean & sanitize options
      const expires = `; expires=${(options.expires || '').replace(
        'expires=',
        '',
      )}`; // Default is "; expires="
      
      const path = (options.path || '/').replace('path=', ''); // Default is "path=/"

      document.cookie = `${encodedKey}=${encodedValue || ''}${expires}; path=${path}`;
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async deleteCookie(options: DeleteCookieOptions): Promise<void> {
    try {
      document.cookie = `${options.key}=; Max-Age=0`;
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async clearCookies(): Promise<void> {
    try {
      const cookies = document.cookie.split(';') || [];
      for (const cookie of cookies) {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      }
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async clearAllCookies(): Promise<void> {
    try {
      await this.clearCookies();
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
}

export const CapacitorCookies = registerPlugin<CapacitorCookiesPlugin>(
  'CapacitorCookies',
  {
      web: () => new CapacitorCookiesPluginWeb(),
  }
);

/******** END COOKIES PLUGIN ********/