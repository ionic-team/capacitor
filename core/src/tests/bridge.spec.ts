/**
 * @jest-environment jsdom
 */

import { initBridge } from '../../native-bridge';
import type { CapacitorInstance, PluginResult, WindowCapacitor } from '../definitions-internal';
import { createCapacitor } from '../runtime';

describe('bridge', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;
  let originalFetch: typeof window.fetch;
  let originalHeaders: typeof Headers;
  let originalRequest: typeof Request;
  let originalResponse: typeof Response;

  beforeEach(() => {
    originalFetch = window.fetch;
    originalHeaders = globalThis.Headers;
    originalRequest = globalThis.Request;
    originalResponse = globalThis.Response;
    win = {};
    initBridge(win);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.prompt = () => {};
  });

  afterEach(() => {
    window.fetch = originalFetch;
    globalThis.Headers = originalHeaders;
    globalThis.Request = originalRequest;
    globalThis.Response = originalResponse;
  });

  it('android nativePromise error', (done) => {
    mockAndroidPluginResult({
      success: false,
      data: null,
      error: { message: 'darn it' },
    });
    initBridge(win);

    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('android');
    expect(cap.isNativePlatform()).toBe(true);

    cap
      .nativePromise('id', 'method')
      .then(() => {
        done('should throw error');
      })
      .catch((err) => {
        try {
          expect(err.message).toBe('darn it');
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it('android nativePromise success', (done) => {
    mockAndroidPluginResult({
      success: true,
      data: { mph: 88 },
    });
    initBridge(win);

    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('android');
    expect(cap.isNativePlatform()).toBe(true);

    cap
      .nativePromise('id', 'method')
      .then((data) => {
        try {
          expect(data).toEqual({ mph: 88 });
          done();
        } catch (e) {
          done(e);
        }
      })
      .catch(done);
  });

  it('ios nativeCallback w/ callback error', (done) => {
    mockIosPluginResult({
      data: null,
      success: false,
      error: { message: 'darn it' },
    });
    initBridge(win);

    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('ios');
    expect(cap.isNativePlatform()).toBe(true);

    cap.nativeCallback('pluginName', 'methodName', {}, (data, err) => {
      try {
        expect(data).toEqual(null);
        expect(err.message).toBe('darn it');
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('ios nativeCallback w/ options and callback, success', (done) => {
    mockIosPluginResult({
      data: { mph: 88 },
      success: true,
    });
    initBridge(win);

    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('ios');
    expect(cap.isNativePlatform()).toBe(true);

    cap.nativeCallback('pluginName', 'methodName', {}, (data, err) => {
      try {
        expect(data).toEqual({ mph: 88 });
        expect(err).toBe(undefined);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('android patched fetch sends Blob bodies as base64 binary data', async () => {
    mockFetchApi();
    let callData: any;
    (win as any).androidBridge = {
      postMessage: (m: string) => {
        callData = JSON.parse(m);
        Promise.resolve().then(() => {
          cap.fromNative!({
            callbackId: callData.callbackId,
            methodName: callData.methodName,
            pluginId: callData.pluginId,
            success: true,
            data: {
              data: 'ok',
              headers: { 'Content-Type': 'text/plain' },
              status: 200,
              url: 'https://example.com/upload',
            },
          });
        });
      },
    };
    (win as any).CapacitorHttpAndroidInterface = {
      isEnabled: () => true,
    };
    initBridge(win);
    cap = createCapacitor(win);

    await window.fetch('https://example.com/upload', {
      body: new Blob([new Uint8Array([1, 2])], { type: 'application/octet-stream' }),
      headers: { 'Content-Type': 'application/octet-stream' },
      method: 'POST',
    });

    expect(callData.options.data).toBe('AQI=');
    expect(callData.options.dataType).toBe('binary');
    expect(callData.options.headers['content-type']).toBe('application/octet-stream');
  });

  it('android patched fetch sends ArrayBuffer bodies as base64 binary data', async () => {
    mockFetchApi();
    let callData: any;
    (win as any).androidBridge = {
      postMessage: (m: string) => {
        callData = JSON.parse(m);
        Promise.resolve().then(() => {
          cap.fromNative!({
            callbackId: callData.callbackId,
            methodName: callData.methodName,
            pluginId: callData.pluginId,
            success: true,
            data: {
              data: 'ok',
              headers: { 'Content-Type': 'text/plain' },
              status: 200,
              url: 'https://example.com/upload',
            },
          });
        });
      },
    };
    (win as any).CapacitorHttpAndroidInterface = {
      isEnabled: () => true,
    };
    initBridge(win);
    cap = createCapacitor(win);

    await window.fetch('https://example.com/upload', {
      body: new Uint8Array([3, 4]).buffer,
      headers: { 'Content-Type': 'application/octet-stream' },
      method: 'POST',
    });

    expect(callData.options.data).toBe('AwQ=');
    expect(callData.options.dataType).toBe('binary');
    expect(callData.options.headers['content-type']).toBe('application/octet-stream');
  });

  it('android patched fetch returns binary responses byte-for-byte', async () => {
    mockFetchApi();
    let callData: any;
    (win as any).androidBridge = {
      postMessage: (m: string) => {
        callData = JSON.parse(m);
        Promise.resolve().then(() => {
          cap.fromNative!({
            callbackId: callData.callbackId,
            methodName: callData.methodName,
            pluginId: callData.pluginId,
            success: true,
            data: {
              data: 'AQI=',
              headers: { 'Content-Type': 'application/octet-stream' },
              status: 200,
              url: 'https://example.com/upload',
            },
          });
        });
      },
    };
    (win as any).CapacitorHttpAndroidInterface = {
      isEnabled: () => true,
    };
    initBridge(win);
    cap = createCapacitor(win);

    const response = await window.fetch('https://example.com/upload', {
      body: 'body',
      method: 'POST',
    });

    expect(callData.options.responseType).toBe('arraybuffer');
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([1, 2]);
  });

  const mockAndroidPluginResult = (pluginResult: PluginResult) => {
    win.androidBridge = {
      postMessage: (m) => {
        const d = JSON.parse(m);
        Promise.resolve().then(() => {
          pluginResult.callbackId = d.callbackId;
          pluginResult.methodName = d.methodName;
          cap.fromNative!(pluginResult);
        });
      },
    };
  };

  const mockIosPluginResult = (pluginResult: PluginResult) => {
    win.webkit = {
      messageHandlers: {
        bridge: {
          postMessage: (m) => {
            Promise.resolve().then(() => {
              pluginResult.callbackId = m.callbackId;
              pluginResult.methodName = m.methodName;
              cap.fromNative!(pluginResult);
            });
          },
        },
      },
    };
  };

  const mockFetchApi = () => {
    class MockHeaders {
      private readonly headers: Record<string, string> = {};

      constructor(init?: HeadersInit) {
        if (init == null) {
          return;
        }

        Object.entries(init as Record<string, string>).forEach(([key, value]) => {
          this.headers[key.toLocaleLowerCase()] = value;
        });
      }

      delete(key: string) {
        delete this.headers[key.toLocaleLowerCase()];
      }

      entries() {
        return Object.entries(this.headers)[Symbol.iterator]();
      }

      get(key: string) {
        return this.headers[key.toLocaleLowerCase()] ?? null;
      }

      has(key: string) {
        return this.headers[key.toLocaleLowerCase()] != null;
      }

      set(key: string, value: string) {
        this.headers[key.toLocaleLowerCase()] = value;
      }
    }

    class MockRequest {
      readonly body?: BodyInit | null;
      readonly headers: Headers;
      readonly method: string;
      readonly url: string;

      constructor(resource: RequestInfo | URL, init?: RequestInit) {
        this.body = init?.body;
        this.headers = new globalThis.Headers(init?.headers);
        this.method = init?.method ?? 'GET';
        this.url = resource.toString();
      }
    }

    class MockResponse {
      private readonly bytes: Uint8Array;

      constructor(
        body?: BodyInit | null,
        readonly init?: ResponseInit,
      ) {
        if (body instanceof ArrayBuffer) {
          this.bytes = new Uint8Array(body);
        } else if (ArrayBuffer.isView(body)) {
          this.bytes = new Uint8Array(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength));
        } else if (typeof body === 'string') {
          this.bytes = new TextEncoder().encode(body);
        } else {
          this.bytes = new Uint8Array();
        }
      }

      async arrayBuffer() {
        return this.bytes.buffer.slice(this.bytes.byteOffset, this.bytes.byteOffset + this.bytes.byteLength);
      }
    }

    globalThis.Headers = MockHeaders as any;
    globalThis.Request = MockRequest as any;
    globalThis.Response = MockResponse as any;
  };
});
