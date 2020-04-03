import { WebPlugin } from './index';

import {
  HttpPlugin,
  HttpOptions,
  //HttpCookie,
  HttpDeleteCookieOptions,
  HttpHeaders,
  HttpResponse,
  HttpSetCookieOptions,
  HttpClearCookiesOptions,
  HttpGetCookiesOptions,
  HttpGetCookiesResult,
  //HttpParams,
  HttpDownloadFileOptions,
  HttpDownloadFileResult,
  HttpUploadFileOptions,
  HttpUploadFileResult
} from '../core-plugin-definitions';

export class HttpPluginWeb extends WebPlugin implements HttpPlugin {
  constructor() {
    super({
      name: 'Http',
      platforms: ['web', 'electron']
    });
  }

  private getRequestHeader(headers: HttpHeaders, key: string): string {
    const originalKeys = Object.keys(headers);
    const keys = Object.keys(headers).map(k => k.toLocaleLowerCase());
    const lowered = keys.reduce((newHeaders, key, index) => {
      newHeaders[key] = headers[originalKeys[index]];
      return newHeaders;
    }, {} as HttpHeaders);

    return lowered[key.toLocaleLowerCase()];
  }

  private nativeHeadersToObject(headers: Headers): HttpHeaders {
    const h = {} as HttpHeaders;

    headers.forEach((value: string, key: string) => {
      h[key] = value;
    });

    return h;
  }

  private makeFetchOptions(options: HttpOptions, fetchExtra: RequestInit): RequestInit {
    const req = {
      method: options.method || 'GET',
      headers: options.headers,
      ...(fetchExtra || {})
    } as RequestInit;

    const contentType = this.getRequestHeader(options.headers || {}, 'content-type') || '';

    if (contentType.indexOf('application/json') === 0) {
      req['body'] = JSON.stringify(options.data);
    } else if (contentType.indexOf('application/x-www-form-urlencoded') === 0) {
    } else if (contentType.indexOf('multipart/form-data') === 0) {
    }

    return req;
  }

  async request(options: HttpOptions): Promise<HttpResponse> {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);

    const ret = await fetch(options.url, fetchOptions);

    const contentType = ret.headers.get('content-type');

    let data;
    if (contentType && contentType.indexOf('application/json') === 0) {
      data = await ret.json();
    } else {
      data = await ret.text();
    }

    return {
      status: ret.status,
      data,
      headers: this.nativeHeadersToObject(ret.headers)
    }
  }

  async setCookie(options: HttpSetCookieOptions) {
    var expires = "";
    if (options.ageDays) {
      const date = new Date();
      date.setTime(date.getTime() + (options.ageDays * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = options.key + "=" + (options.value || "") + expires + "; path=/";
  }

  async getCookies(_options: HttpGetCookiesOptions): Promise<HttpGetCookiesResult> {
    if (!document.cookie) {
      return { value: [] }
    }

    var cookies = document.cookie.split(';');
    return {
      value: cookies.map(c => {
        const cParts = c.split(';').map(cv => cv.trim());
        const cNameValue = cParts[0];
        const cValueParts = cNameValue.split('=');
        const key = cValueParts[0];
        const value = cValueParts[1];

        return {
          key,
          value
        }
      })
    }
  }

  async deleteCookie(options: HttpDeleteCookieOptions) {
    document.cookie = options.key + '=; Max-Age=0'
  }

  async clearCookies(_options: HttpClearCookiesOptions) {
    document.cookie
      .split(";")
      .forEach(c =>
        document.cookie = c.replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`));
  }

  async uploadFile(options: HttpUploadFileOptions): Promise<HttpUploadFileResult> {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);

    const formData = new FormData();
    formData.append(options.name, options.blob);

    await fetch(options.url, {
      ...fetchOptions,
      body: formData,
      method: 'POST'
    });

    return {};
  }

  async downloadFile(options: HttpDownloadFileOptions): Promise<HttpDownloadFileResult> {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);

    const ret = await fetch(options.url, fetchOptions);

    const blob = await ret.blob();

    return {
      blob
    }
  }
}

const Http = new HttpPluginWeb();

export { Http };
