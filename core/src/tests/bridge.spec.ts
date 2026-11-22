/**
 * @jest-environment jsdom
 */

import { initBridge } from '../../native-bridge';
import type { CapacitorInstance, PluginResult, WindowCapacitor } from '../definitions-internal';
import { createCapacitor } from '../runtime';

describe('bridge', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;

  beforeEach(() => {
    win = {};
    initBridge(win);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.prompt = () => {};
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

  it('android patches fetch when CapacitorNativeConfig.httpEnabled is true without CapacitorHttpAndroidInterface', () => {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;
    const stubFetch = jest.fn();
    window.fetch = stubFetch;
    try {
      win.androidBridge = { postMessage: jest.fn() };
      win.CapacitorNativeConfig = { cookiesEnabled: false, httpEnabled: true };
      initBridge(win);
      expect(window.fetch).not.toBe(stubFetch);
      expect(win.CapacitorWebFetch).toBe(stubFetch);
    } finally {
      window.fetch = originalFetch;
      window.XMLHttpRequest = originalXHR;
    }
  });

  it('android does not patch fetch when CapacitorNativeConfig.httpEnabled is false', () => {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;
    const stubFetch = jest.fn();
    window.fetch = stubFetch;
    try {
      win.androidBridge = { postMessage: jest.fn() };
      win.CapacitorNativeConfig = { cookiesEnabled: false, httpEnabled: false };
      win.CapacitorHttpAndroidInterface = { isEnabled: jest.fn(() => true) };
      initBridge(win);
      expect(window.fetch).toBe(stubFetch);
      expect(win.CapacitorHttpAndroidInterface.isEnabled).not.toHaveBeenCalled();
    } finally {
      window.fetch = originalFetch;
      window.XMLHttpRequest = originalXHR;
    }
  });

  it('android keeps browser document.cookie working when CapacitorCookiesAndroidInterface is absent', () => {
    try {
      win.androidBridge = { postMessage: jest.fn() };
      win.CapacitorNativeConfig = { cookiesEnabled: true, httpEnabled: false };

      initBridge(win);

      document.cookie = 'cap_test=1';
      expect(document.cookie).toContain('cap_test=1');
    } finally {
      document.cookie = 'cap_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  });

  const mockAndroidPluginResult = (pluginResult: PluginResult) => {
    win.androidBridge = {
      postMessage: (m) => {
        const d = JSON.parse(m);
        Promise.resolve().then(() => {
          pluginResult.callbackId = d.callbackId;
          pluginResult.methodName = d.methodName;
          cap.fromNative(pluginResult);
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
              cap.fromNative(pluginResult);
            });
          },
        },
      },
    };
  };
});
