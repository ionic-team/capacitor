import type { Plugin, PluginResultError } from '../definitions';
import type {
  CapacitorInstance,
  WindowCapacitor,
} from '../definitions-internal';
import { createCapacitor } from '../runtime';
import { ExceptionCode, NativePlugin } from '../util';

describe('plugin', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;

  beforeEach(() => {
    win = {};
  });

  it('error from missing method from native implementation', async done => {
    // mock the global with the android bridge
    mockAndroidBridge();

    // simulate native adding the bridge before the core runtime
    // but it's not adding the mph() method
    mockNativeImplementationJsBridge('Awesome', 'whatever');

    // core runtime creates the actual Capacitor instance
    cap = createCapacitor(win);

    try {
      const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
        android: NativePlugin,
      });
      await Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(`"Awesome.mph()" is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('native implementation', async () => {
    // mock the global with the android bridge
    mockAndroidBridge();

    // simulate native adding the bridge before the core runtime
    mockNativeImplementationJsBridge('Awesome', 'mph');

    // core runtime creates the actual Capacitor instance
    cap = createCapacitor(win);

    // user runtime registers the plugin
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: NativePlugin,
    });

    const results = await Awesome.mph();
    expect(results).toBe(88);
  });

  it('error from missing native implementation', async done => {
    // mock the global with the android bridge
    mockAndroidBridge();

    // do not simulate native adding the bridge before the core runtime

    // core runtime creates the actual Capacitor instance
    cap = createCapacitor(win);

    try {
      cap.registerPlugin<AwesomePlugin>('Awesome', {
        android: NativePlugin,
      });
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(
        `"Awesome" plugin is not implementated on android`,
      );
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('error lazy loading implementation', async done => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: () => Promise.reject('unable to load module'),
    });

    try {
      await Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e).toBe('unable to load module');
      done();
    }
  });

  it('call method on lazy loaded implementation', async () => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: () =>
        // lazy load implementation
        Promise.resolve().then(() => {
          return {
            mph: () => 88,
          };
        }),
    });

    const rtn1 = await Awesome.mph();
    expect(rtn1).toBe(88);

    const rtn2 = await Awesome.mph();
    expect(rtn2).toBe(88);
  });

  it('call method on already loaded implementation', async () => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: {
        // implementation already ready
        mph: () => 88,
      },
    });

    const rtn1 = await Awesome.mph();
    expect(rtn1).toBe(88);

    const rtn2 = await Awesome.mph();
    expect(rtn2).toBe(88);
  });

  it('call method that had an error', async () => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: {
        mph: () => {
          throw new Error('nope!');
        },
      },
    });

    expect(() => {
      Awesome.mph();
    }).toThrowError('nope!');
  });

  it('missing method on lazy loaded implementation', async done => {
    cap = createCapacitor(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: () =>
        Promise.resolve().then(() => {
          return {};
        }),
    });

    try {
      await Awesome.mph();
      done('did not throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome.mph()" is not implemented on web`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('missing method on already loaded implementation', done => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: {},
    });

    try {
      Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome.mph()" is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('no web platform implementation', done => {
    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('web');

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: NativePlugin,
      ios: NativePlugin,
    });

    try {
      Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on web`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('no native platform implementation', done => {
    mockAndroidBridge({ mph: 88 });
    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('android');

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      ios: NativePlugin,
      web: { mph: () => 88 },
    });

    try {
      Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('addListener, w/out addListener on implementation', done => {
    mockAndroidBridge({ mph: 88 });
    cap = createCapacitor(win);
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {});

    const rtn = Awesome.addListener('eventName', data => {
      try {
        expect(data).toEqual({ mph: 88 });
        done();
      } catch (e) {
        done(e);
      }
    });

    expect(rtn).toBeDefined();
    expect(typeof rtn.remove === 'function').toBe(true);
  });

  it('removeAllListeners', () => {
    cap = createCapacitor(win);
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {});

    const rtn = Awesome.removeAllListeners();
    expect(rtn).toBeUndefined();
  });

  const mockAndroidBridge = (responseData?: any, err?: PluginResultError) => {
    win.androidBridge = {
      postMessage: m => {
        const d = JSON.parse(m);
        Promise.resolve().then(() => {
          cap.fromNative({
            callbackId: d.callbackId,
            methodName: d.methodName,
            data: responseData,
            error: err,
            success: !err,
          });
        });
      },
    };
  };

  const mockNativeImplementationJsBridge = (
    pluginClassName: string,
    methodName: string,
  ) => {
    // mocking how native code adds their plugin js bridge to the global
    // ios/Capacitor/Capacitor/JSExport.swift
    // android/capacitor/src/main/java/com/getcapacitor/JSExport.java

    (function (w) {
      const a = (w.Capacitor = w.Capacitor || {});
      const p = (a.Plugins = a.Plugins || {});
      const t = (p[pluginClassName] = {}) as any;
      t.addListener = function (eventName: any, callback: any) {
        return w.Capacitor.addListener(pluginClassName, eventName, callback);
      };

      t[methodName] = function () {
        return new Promise(resolve => {
          resolve(88);
        });
      };
    })(win as any);
  };
});

interface AwesomePlugin extends Plugin {
  mph(): Promise<number>;
}
