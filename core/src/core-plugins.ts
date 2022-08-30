import type { Plugin } from './definitions';
import { registerPlugin } from './global';
import { WebPlugin } from './web-plugin';

export interface WebViewPlugin extends Plugin {
  setServerBasePath(options: WebViewPath): Promise<void>;
  getServerBasePath(): Promise<WebViewPath>;
  persistServerBasePath(): Promise<void>;
}

export interface WebViewPath {
  path: string;
}

export const WebView = /*#__PURE__*/ registerPlugin<WebViewPlugin>('WebView');

/******** HTTP PLUGIN ********/
export interface CapacitorHttpPlugin {
  request(options: HttpOptions): Promise<HttpResponse>;
  get(options: HttpOptions): Promise<HttpResponse>;
  post(options: HttpOptions): Promise<HttpResponse>;
  put(options: HttpOptions): Promise<HttpResponse>;
  patch(options: HttpOptions): Promise<HttpResponse>;
  delete(options: HttpOptions): Promise<HttpResponse>;
}

export type HttpResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'json'
  | 'text'
  | 'document';

export interface HttpOptions {
  url: string;
  method?: string;
  params?: HttpParams;
  data?: any;
  headers?: HttpHeaders;
  /**
   * How long to wait to read additional data. Resets each time new
   * data is received
   */
  readTimeout?: number;
  /**
   * How long to wait for the initial connection.
   */
  connectTimeout?: number;
  /**
   * Sets whether automatic HTTP redirects should be disabled
   */
  disableRedirects?: boolean;
  /**
   * Extra arguments for fetch when running on the web
   */
  webFetchExtra?: RequestInit;
  /**
   * This is used to parse the response appropriately before returning it to
   * the requestee. If the response content-type is "json", this value is ignored.
   */
  responseType?: HttpResponseType;
  /**
   * Use this option if you need to keep the URL unencoded in certain cases
   * (already encoded, azure/firebase testing, etc.). The default is _true_.
   */
  shouldEncodeUrlParams?: boolean;
}

export interface HttpParams {
  [key: string]: string | string[];
}

export interface HttpHeaders {
  [key: string]: string;
}

export interface HttpResponse {
  data: any;
  status: number;
  headers: HttpHeaders;
  url: string;
}

// UTILITY FUNCTIONS

/**
 * Normalize an HttpHeaders map by lowercasing all of the values
 * @param headers The HttpHeaders object to normalize
 */
const normalizeHttpHeaders = (headers: HttpHeaders = {}): HttpHeaders => {
  const originalKeys = Object.keys(headers);
  const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
  const normalized = loweredKeys.reduce<HttpHeaders>((acc, key, index) => {
    acc[key] = headers[originalKeys[index]];
    return acc;
  }, {});
  return normalized;
};

/**
 * Builds a string of url parameters that
 * @param params A map of url parameters
 * @param shouldEncode true if you should encodeURIComponent() the values (true by default)
 */
const buildUrlParams = (
  params?: HttpParams,
  shouldEncode = true,
): string | null => {
  if (!params) return null;

  const output = Object.entries(params).reduce((accumulator, entry) => {
    const [key, value] = entry;

    let encodedValue: string;
    let item: string;
    if (Array.isArray(value)) {
      item = '';
      value.forEach(str => {
        encodedValue = shouldEncode ? encodeURIComponent(str) : str;
        item += `${key}=${encodedValue}&`;
      });
      // last character will always be "&" so slice it off
      item.slice(0, -1);
    } else {
      encodedValue = shouldEncode ? encodeURIComponent(value) : value;
      item = `${key}=${encodedValue}`;
    }

    return `${accumulator}&${item}`;
  }, '');

  // Remove initial "&" from the reduce
  return output.substr(1);
};

/**
 * Build the RequestInit object based on the options passed into the initial request
 * @param options The Http plugin options
 * @param extra Any extra RequestInit values
 */
export const buildRequestInit = (
  options: HttpOptions,
  extra: RequestInit = {},
): RequestInit => {
  const output: RequestInit = {
    method: options.method || 'GET',
    headers: options.headers,
    ...extra,
  };

  // Get the content-type
  const headers = normalizeHttpHeaders(options.headers);
  const type = headers['content-type'] || '';

  // If body is already a string, then pass it through as-is.
  if (typeof options.data === 'string') {
    output.body = options.data;
  }
  // Build request initializers based off of content-type
  else if (type.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.data || {})) {
      params.set(key, value as any);
    }
    output.body = params.toString();
  } else if (type.includes('multipart/form-data')) {
    const form = new FormData();
    if (options.data instanceof FormData) {
      options.data.forEach((value, key) => {
        form.append(key, value);
      });
    } else {
      for (const key of Object.keys(options.data)) {
        form.append(key, options.data[key]);
      }
    }
    output.body = form;
    const headers = new Headers(output.headers);
    headers.delete('content-type'); // content-type will be set by `window.fetch` to includy boundary
    output.headers = headers;
  } else if (
    type.includes('application/json') ||
    typeof options.data === 'object'
  ) {
    output.body = JSON.stringify(options.data);
  }

  return output;
};

// WEB IMPLEMENTATION
export class CapacitorHttpPluginWeb
  extends WebPlugin
  implements CapacitorHttpPlugin
{
  /**
   * Perform an Http request given a set of options
   * @param options Options to build the HTTP request
   */
  async request(options: HttpOptions): Promise<HttpResponse> {
    const requestInit = buildRequestInit(options, options.webFetchExtra);
    const urlParams = buildUrlParams(
      options.params,
      options.shouldEncodeUrlParams,
    );
    const url = urlParams ? `${options.url}?${urlParams}` : options.url;

    const response = await fetch(url, requestInit);
    const contentType = response.headers.get('content-type') || '';

    // Default to 'text' responseType so no parsing happens
    let { responseType = 'text' } = response.ok ? options : {};

    // If the response content-type is json, force the response to be json
    if (contentType.includes('application/json')) {
      responseType = 'json';
    }

    let data: any;
    switch (responseType) {
      case 'arraybuffer':
      case 'blob':
        //TODO: Add Blob Support
        break;
      case 'json':
        data = await response.json();
        break;
      case 'document':
      case 'text':
      default:
        data = await response.text();
    }

    // Convert fetch headers to Capacitor HttpHeaders
    const headers = {} as HttpHeaders;
    response.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });

    return {
      data,
      headers,
      status: response.status,
      url: response.url,
    };
  }

  /**
   * Perform an Http GET request given a set of options
   * @param options Options to build the HTTP request
   */
  async get(options: HttpOptions): Promise<HttpResponse> {
    return this.request({ ...options, method: 'GET' });
  }

  /**
   * Perform an Http POST request given a set of options
   * @param options Options to build the HTTP request
   */
  async post(options: HttpOptions): Promise<HttpResponse> {
    return this.request({ ...options, method: 'POST' });
  }

  /**
   * Perform an Http PUT request given a set of options
   * @param options Options to build the HTTP request
   */
  async put(options: HttpOptions): Promise<HttpResponse> {
    return this.request({ ...options, method: 'PUT' });
  }

  /**
   * Perform an Http PATCH request given a set of options
   * @param options Options to build the HTTP request
   */
  async patch(options: HttpOptions): Promise<HttpResponse> {
    return this.request({ ...options, method: 'PATCH' });
  }

  /**
   * Perform an Http DELETE request given a set of options
   * @param options Options to build the HTTP request
   */
  async delete(options: HttpOptions): Promise<HttpResponse> {
    return this.request({ ...options, method: 'DELETE' });
  }
}

export const CapacitorHttp = registerPlugin<CapacitorHttpPlugin>(
  'CapacitorHttp',
  {
    web: () => new CapacitorHttpPluginWeb(),
  },
);

/******** END HTTP PLUGIN ********/
