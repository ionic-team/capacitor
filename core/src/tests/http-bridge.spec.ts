/**
 * @jest-environment jsdom
 */

import { initBridge } from '../../native-bridge';
import type { CapacitorInstance, WindowCapacitor } from '../definitions-internal';
import { createCapacitor } from '../runtime';

describe('CapacitorHttp binary request body bridge', () => {
  const sampleBytes = new Uint8Array([0x1f, 0x8b, 0x08, 0x00, 0xff, 0x00, 0x80, 0x7f]);
  const sampleBase64 = Buffer.from(sampleBytes).toString('base64');

  let win: WindowCapacitor;
  let cap: CapacitorInstance;
  let capturedCalls: any[];
  let origWindowFetch: typeof window.fetch | undefined;
  let origWindowXHR: typeof window.XMLHttpRequest | undefined;
  let origFetch: typeof globalThis.fetch | undefined;
  let origXHR: typeof globalThis.XMLHttpRequest | undefined;
  let origRequest: typeof globalThis.Request | undefined;
  let origResponse: typeof globalThis.Response | undefined;
  let origHeaders: typeof globalThis.Headers | undefined;

  beforeEach(() => {
    origWindowFetch = window.fetch;
    origWindowXHR = window.XMLHttpRequest;
    origFetch = globalThis.fetch;
    origXHR = globalThis.XMLHttpRequest;
    origRequest = globalThis.Request;
    origResponse = globalThis.Response;
    origHeaders = globalThis.Headers;

    if (typeof globalThis.Request === 'undefined') {
      (globalThis as any).Headers = class SimpleHeaders {
        private map = new Map<string, string>();
        constructor(init?: Record<string, string>) {
          if (init) {
            for (const [k, v] of Object.entries(init)) {
              this.map.set(k.toLowerCase(), v);
            }
          }
        }
        has(name: string) {
          return this.map.has(name.toLowerCase());
        }
        get(name: string) {
          return this.map.get(name.toLowerCase()) ?? null;
        }
        entries() {
          return this.map.entries();
        }
      };

      (globalThis as any).Request = class SimpleRequest {
        url: string;
        method: string;
        body: any;
        headers: any;
        constructor(url: string, init: any = {}) {
          this.url = url;
          this.method = init.method || 'GET';
          this.body = init.body;
          this.headers = new (globalThis as any).Headers(init.headers);
        }
      };

      (globalThis as any).Response = class SimpleResponse {
        body: any;
        status: number;
        headers: any;
        constructor(body: any, init: any = {}) {
          this.body = body;
          this.status = init.status ?? 200;
          this.headers = init.headers;
        }
      };
    }

    capturedCalls = [];
    win = {
      CapacitorWebFetch: undefined,
      CapacitorHttpAndroidInterface: {
        isEnabled: () => true,
      },
      androidBridge: {
        postMessage: (raw: string) => {
          const msg = JSON.parse(raw);
          capturedCalls.push(msg);
          Promise.resolve().then(() => {
            cap.fromNative({
              callbackId: msg.callbackId,
              methodName: msg.methodName,
              success: true,
              data: {
                status: 200,
                headers: { 'Content-Type': 'application/octet-stream' },
                data: '',
              },
            });
          });
        },
      },
    } as any;

    initBridge(win);
    cap = createCapacitor(win);
  });

  afterEach(() => {
    window.fetch = origWindowFetch as any;
    window.XMLHttpRequest = origWindowXHR as any;
    globalThis.fetch = origFetch as any;
    globalThis.XMLHttpRequest = origXHR as any;
    globalThis.Request = origRequest as any;
    globalThis.Response = origResponse as any;
    globalThis.Headers = origHeaders as any;
  });

  it('encodes ArrayBuffer fetch bodies as base64 with file dataType', async () => {
    await window.fetch('https://example.com/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: sampleBytes.buffer.slice(0),
    });

    const req = capturedCalls.find((c) => c.pluginId === 'CapacitorHttp');
    expect(req).toBeDefined();
    expect(req.options.dataType).toBe('file');
    expect(req.options.data).toBe(sampleBase64);
  });

  it('preserves non-UTF-8 Uint8Array and sliced TypedArray byte ranges as base64', async () => {
    const padded = new Uint8Array([0x00, ...sampleBytes, 0xff]);
    const sliceView = padded.subarray(1, 1 + sampleBytes.length);

    await window.fetch('https://example.com/json-gzip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
      body: sliceView,
    });

    const req = capturedCalls.find((c) => c.pluginId === 'CapacitorHttp');
    expect(req).toBeDefined();
    expect(req.options.dataType).toBe('file');
    expect(req.options.data).toBe(sampleBase64);
    expect(req.options.headers['content-type'] || req.options.headers['Content-Type']).toBe('application/json');
  });

  it('encodes DataView and Blob bodies as base64 with file dataType', async () => {
    const dv = new DataView(sampleBytes.buffer.slice(0), 2, 4);
    await window.fetch('https://example.com/dataview', {
      method: 'POST',
      body: dv,
    });

    const blob = new Blob([sampleBytes], { type: 'application/x-binary' });
    await window.fetch('https://example.com/blob', {
      method: 'POST',
      body: blob,
    });

    const calls = capturedCalls.filter((c) => c.pluginId === 'CapacitorHttp');
    expect(calls).toHaveLength(2);
    expect(calls[0].options.dataType).toBe('file');
    expect(calls[0].options.data).toBe(Buffer.from(sampleBytes.subarray(2, 6)).toString('base64'));
    expect(calls[0].options.headers['Content-Type']).toBe('application/octet-stream');

    expect(calls[1].options.dataType).toBe('file');
    expect(calls[1].options.data).toBe(sampleBase64);
    expect(calls[1].options.headers['Content-Type']).toBe('application/x-binary');
  });

  it('encodes ArrayBuffer bodies sent via XMLHttpRequest as base64 with file dataType', async () => {
    const xhr = new window.XMLHttpRequest();
    xhr.open('POST', 'https://example.com/xhr-upload');
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.send(sampleBytes.buffer.slice(0));

    await new Promise((resolve) => setTimeout(resolve, 10));

    const req = capturedCalls.find((c) => c.pluginId === 'CapacitorHttp');
    expect(req).toBeDefined();
    expect(req.options.dataType).toBe('file');
    expect(req.options.data).toBe(sampleBase64);
    expect(req.options.headers['Content-Type']).toBe('application/octet-stream');
  });
});
