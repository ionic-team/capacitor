import type {
  CapacitorInstance,
  GlobalInstance,
  PluginResult,
} from '../definitions';
import { createCapacitor } from '../runtime';

describe('bridge', () => {
  let instance: CapacitorInstance;
  let gbl: GlobalInstance;

  beforeEach(() => {
    gbl = {};
  });

  it('android nativePromise error', done => {
    mockAndroidPluginResult({
      success: false,
      data: null,
      error: { message: 'darn it' },
    });

    instance = createCapacitor(gbl);
    expect(instance.getPlatform()).toBe('android');
    expect(instance.isNativePlatform()).toBe(true);

    instance
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

    instance = createCapacitor(gbl);
    expect(instance.getPlatform()).toBe('android');
    expect(instance.isNativePlatform()).toBe(true);

    instance
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

    instance = createCapacitor(gbl);
    expect(instance.getPlatform()).toBe('ios');
    expect(instance.isNativePlatform()).toBe(true);

    instance.nativeCallback('pluginName', 'methodName', {}, (data, err) => {
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

    instance = createCapacitor(gbl);
    expect(instance.getPlatform()).toBe('ios');
    expect(instance.isNativePlatform()).toBe(true);

    instance.nativeCallback('pluginName', 'methodName', {}, (data, err) => {
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
    gbl.androidBridge = {
      postMessage: m => {
        const d = JSON.parse(m);
        Promise.resolve().then(() => {
          pluginResult.callbackId = d.callbackId;
          pluginResult.methodName = d.methodName;
          instance.fromNative(pluginResult);
        });
      },
    };
  };

  const mockIosPluginResult = (pluginResult: PluginResult) => {
    gbl.webkit = {
      messageHandlers: {
        bridge: {
          postMessage: m => {
            Promise.resolve().then(() => {
              pluginResult.callbackId = m.callbackId;
              pluginResult.methodName = m.methodName;
              instance.fromNative(pluginResult);
            });
          },
        },
      },
    };
  };
});
