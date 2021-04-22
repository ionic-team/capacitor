import { initBridge } from '../../native-bridge';
import type {
  CapacitorInstance,
  PluginResult,
  WindowCapacitor,
} from '../definitions-internal';
import { createCapacitor } from '../runtime';

describe('bridge', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;

  beforeEach(() => {
    win = {};
    initBridge(win);
  });

  it('android nativePromise error', done => {
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
      .catch(err => {
        try {
          expect(err.message).toBe('darn it');
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it('android nativePromise success', done => {
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
      .then(data => {
        try {
          expect(data).toEqual({ mph: 88 });
          done();
        } catch (e) {
          done(e);
        }
      })
      .catch(done);
  });

  it('ios nativeCallback w/ callback error', done => {
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

  it('ios nativeCallback w/ options and callback, success', done => {
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

  const mockAndroidPluginResult = (pluginResult: PluginResult) => {
    win.androidBridge = {
      postMessage: m => {
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
          postMessage: m => {
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
