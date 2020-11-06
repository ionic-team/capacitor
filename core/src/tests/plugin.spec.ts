import type { Plugin, PluginResultError } from '../definitions';
import type {
  CapacitorInstance,
  WindowCapacitor,
} from '../definitions-internal';
import { createCapacitor } from '../runtime';
import { ExceptionCode } from '../util';
import { WebPlugin } from '../web-plugin';

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
      const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');
      await Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(`"Awesome.mph()" is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
    }

    try {
      await cap.Plugins.Awesome.mph();
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
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const results1 = await Awesome.mph();
    expect(results1).toBe(88);

    const results2 = await cap.Plugins.Awesome.mph();
    expect(results2).toBe(88);
  });

  it('error from missing native implementation', async done => {
    // mock the global with the android bridge
    mockAndroidBridge();

    // do not simulate native adding the bridge before the core runtime

    // core runtime creates the actual Capacitor instance
    cap = createCapacitor(win);

    try {
      const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');
      await Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
    }

    try {
      await cap.Plugins.Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
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
    }

    try {
      await cap.Plugins.Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e).toBe('unable to load module');
      done();
    }
  });

  it('call method on lazy loaded implementation', async () => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const AwesomePlugin = class {
      val = 88;
      mph() {
        return this.val;
      }
    };

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: () =>
        // lazy load implementation
        Promise.resolve().then(() => new AwesomePlugin()),
    });

    const p1 = Awesome.mph();
    const p2 = cap.Plugins.Awesome.mph();
    expect(await p1).toBe(88);
    expect(await p2).toBe(88);

    const rtn2 = await Awesome.mph();
    expect(rtn2).toBe(88);
  });

  it('call method on already loaded implementation', async () => {
    mockAndroidBridge();
    cap = createCapacitor(win);

    const AwesomePlugin = class {
      val = 88;
      mph() {
        return this.val;
      }
    };

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: new AwesomePlugin(),
    });

    const rtn1 = await Awesome.mph();
    expect(rtn1).toBe(88);

    const rtn2 = await Awesome.mph();
    expect(rtn2).toBe(88);

    const rtn3 = await cap.Plugins.Awesome.mph();
    expect(rtn3).toBe(88);
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

    expect(() => {
      cap.Plugins.Awesome.mph();
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
    }

    try {
      await cap.Plugins.Awesome.mph();
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
    }

    try {
      cap.Plugins.Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome.mph()" is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('automatically register native plugins on global', async () => {
    mockAndroidBridge();

    let count = 88;
    win.Capacitor = {
      Plugins: {
        Awesome: {
          mph: () => {
            return count++;
          },
        },
      },
    } as any;

    cap = createCapacitor(win);

    const results1 = await cap.Plugins.Awesome.mph();
    expect(results1).toBe(88);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');
    const results2 = await Awesome.mph();
    expect(results2).toBe(89);
  });

  it('no web platform implementation', done => {
    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('web');

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    try {
      Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on web`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
    }

    try {
      cap.Plugins.Awesome.mph();
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
      web: { mph: () => 88 },
    });

    try {
      Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
    }

    try {
      cap.Plugins.Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('do not double register a plugin', () => {
    mockAndroidBridge({ mph: 88 });
    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('android');

    const Awesome1 = cap.registerPlugin<AwesomePlugin>('Awesome');
    const Awesome2 = cap.registerPlugin<AwesomePlugin>('Awesome');

    expect(Awesome1).toBe(Awesome2);
  });

  it('addListener, w/out addListener on implementation', done => {
    const LazyWeb = class {
      val = 88;
      addListener(_eventName: string, fn: any) {
        fn(this.val);
      }
    };

    cap = createCapacitor(win);
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: () =>
        new Promise(resolve => {
          setTimeout(() => {
            const lazyWeb = new LazyWeb();
            resolve(lazyWeb);
          }, 100);
        }),
    });

    const rtn = Awesome.addListener('eventName', data => {
      try {
        expect(data).toEqual(88);
        done();
      } catch (e) {
        done(e);
      }
    });

    expect(rtn).toBeDefined();
    expect(typeof rtn.remove === 'function').toBe(true);
  });

  it('removeAllListeners, return void, lazy load and call implementation', done => {
    let called = false;
    const AwesomeWeb = class extends WebPlugin {
      removeAllListeners() {
        called = true;
      }
    };
    cap = createCapacitor(win);
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: () => Promise.resolve(new AwesomeWeb()),
    });

    const rtn = Awesome.removeAllListeners();
    expect(rtn).toBeUndefined();

    setTimeout(() => {
      expect(called).toBe(true);
      done();
    }, 100);
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
