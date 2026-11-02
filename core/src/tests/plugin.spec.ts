/**
 * @jest-environment jsdom
 */

/// <reference lib="es2021.weakref" />
import { setFlagsFromString } from 'v8';
import { runInNewContext } from 'vm';

import { initBridge } from '../../native-bridge';
import type { CapacitorGlobal, Plugin } from '../definitions';
import type { WindowCapacitor, CapacitorInstance } from '../definitions-internal';
import { initCapacitorGlobal } from '../runtime';
import { ExceptionCode } from '../util';
import { WebPlugin } from '../web-plugin';

describe('plugin', () => {
  let win: WindowCapacitor;
  let cap: CapacitorGlobal;

  beforeEach(() => {
    win = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.setImmediate = global.setTimeout;
  });

  it('error from missing method from native implementation', async (done) => {
    // mock the global with the android bridge
    mockAndroidBridge();
    initBridge(win);

    // simulate native adding the plugin header with a garbage method before
    // the core runtime
    mockAndroidPlugin('Awesome', 'whatever');

    // core runtime creates the actual Capacitor instance
    cap = initCapacitorGlobal(win);

    try {
      const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');
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
    initBridge(win);

    // simulate native adding the plugin header before the core runtime
    mockAndroidPlugin('Awesome', 'mph');

    // core runtime creates the actual Capacitor instance
    cap = initCapacitorGlobal(win);
    (cap as CapacitorInstance).nativePromise = async () => 88 as any;

    // user runtime registers the plugin
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const results1 = await Awesome.mph();
    expect(results1).toBe(88);
  });

  it('error from missing native implementation', async (done) => {
    // mock the global with the android bridge
    mockAndroidBridge();
    initBridge(win);

    // do not simulate native adding the bridge before the core runtime

    // core runtime creates the actual Capacitor instance
    cap = initCapacitorGlobal(win);

    try {
      const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');
      await Awesome.mph();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('error lazy loading implementation', async (done) => {
    mockAndroidBridge();
    initBridge(win);

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: async () => {
        throw 'unable to load module';
      },
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
    initBridge(win);

    cap = initCapacitorGlobal(win);

    const AwesomePlugin = class {
      val = 88;
      mph() {
        return this.val;
      }
    };

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: async () => new AwesomePlugin(),
    });

    const p1 = Awesome.mph();
    expect(await p1).toBe(88);

    const rtn2 = await Awesome.mph();
    expect(rtn2).toBe(88);
  });

  it('call method on already loaded implementation', async () => {
    mockAndroidBridge();
    initBridge(win);

    cap = initCapacitorGlobal(win);

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
  });

  it('call method that had an error', async () => {
    mockAndroidBridge();
    initBridge(win);

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: {
        mph: async () => {
          throw new Error('nope!');
        },
      },
    });

    expect(async () => Awesome.mph()).rejects.toThrowError('nope!');
  });

  it('missing method on lazy loaded implementation', async (done) => {
    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: async () => ({}),
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

  it('missing method on already loaded implementation', async (done) => {
    mockAndroidBridge();
    initBridge(win);

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      android: {},
    });

    try {
      await Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome.mph()" is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('no web platform implementation', async (done) => {
    cap = initCapacitorGlobal(win);
    expect(cap.getPlatform()).toBe('web');

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    try {
      await Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on web`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('no native platform implementation', async (done) => {
    mockAndroidBridge();
    initBridge(win);

    cap = initCapacitorGlobal(win);
    expect(cap.getPlatform()).toBe('android');

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: { mph: async () => 88 },
    });

    try {
      await Awesome.mph();
      done('should throw error');
    } catch (e) {
      expect(e.message).toBe(`"Awesome" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  it('do not double register a plugin', () => {
    mockAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);
    expect(cap.getPlatform()).toBe('android');

    const Awesome1 = cap.registerPlugin<AwesomePlugin>('Awesome');
    const Awesome2 = cap.registerPlugin<AwesomePlugin>('Awesome');

    expect(Awesome1).toBe(Awesome2);
  });

  it('addListener, w/out addListener on implementation', async (done) => {
    const LazyWeb = class {
      val = 88;
      async addListener(_eventName: string, fn: any) {
        fn(this.val);
      }
    };

    cap = initCapacitorGlobal(win);
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: async () => new LazyWeb(),
    });

    Awesome.addListener('eventName', (data) => {
      try {
        expect(data).toEqual(88);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('sync addListener on android', async () => {
    mockAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const rtn = Awesome.addListener('eventName', () => {
      // ignore
    });

    expect(rtn).toBeDefined();
    expect(typeof (rtn as any).remove === 'function').toBe(true);
  });

  it('async addListener on android', async () => {
    mockAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const rtn = await Awesome.addListener('eventName', () => {
      // ignore
    });

    expect(rtn).toBeDefined();
    expect(typeof (rtn as any).remove === 'function').toBe(true);
  });

  it('stops forwarding native events once the listener is removed', async () => {
    const messages = mockRecordingAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const received: unknown[] = [];
    const handle = await Awesome.addListener('eventName', (data) => received.push(data));

    const listenerCallbackId = messages.find((m) => m.methodName === 'addListener').callbackId;
    emitNativeEvent(listenerCallbackId, 'before');
    await handle.remove();
    emitNativeEvent(listenerCallbackId, 'after');

    expect(received).toEqual(['before']);
  });

  it('does not give the native bridge a callback to keep for removeListener', async () => {
    const messages = mockRecordingAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const handle = await Awesome.addListener('eventName', () => {
      // ignore
    });
    await handle.remove();
    await Promise.resolve();

    const removeListenerMessage = messages.find((m) => m.methodName === 'removeListener');
    expect(removeListenerMessage.callbackId).toBe('-1');
  });

  it('stops forwarding native events after removeAllListeners', async () => {
    const messages = mockRecordingAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    const received: unknown[] = [];
    await Awesome.addListener('eventName', (data) => received.push(data));

    const listenerCallbackId = messages.find((m) => m.methodName === 'addListener').callbackId;
    emitNativeEvent(listenerCallbackId, 'before');
    await Awesome.removeAllListeners();
    emitNativeEvent(listenerCallbackId, 'after');

    expect(received).toEqual(['before']);
  });

  it('lets a removed native listener be garbage collected', async () => {
    setFlagsFromString('--expose-gc');
    const collectGarbage = runInNewContext('gc') as () => void;

    mockRecordingAndroidBridge();
    initBridge(win);
    mockAndroidPlugin('Awesome', 'mph');

    cap = initCapacitorGlobal(win);

    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome');

    // Stands in for what a real listener closes over, such as an iframe's window.
    let captured: WeakRef<object> | undefined;
    const register = () => {
      const capture = {};
      captured = new WeakRef(capture);
      return Awesome.addListener('eventName', () => capture);
    };
    const handle = await register();
    await handle.remove();

    // A WeakRef keeps its target alive until the current job ends, so collect in a later one.
    await new Promise((resolve) => setTimeout(resolve, 0));
    collectGarbage();

    expect(captured?.deref()).toBeUndefined();
  });

  it('async removeAllListeners on web, lazy load and call implementation', async (done) => {
    const AwesomeWeb = class extends WebPlugin {
      async removeAllListeners() {
        setImmediate(() => done());
      }
    };
    cap = initCapacitorGlobal(win);
    const Awesome = cap.registerPlugin<AwesomePlugin>('Awesome', {
      web: async () => new AwesomeWeb(),
    });

    const rtn = await Awesome.removeAllListeners();
    expect(rtn).toBeUndefined();
  });

  const mockAndroidBridge = () => {
    win.androidBridge = {
      postMessage: () => {
        // ignore
      },
    };
  };

  const mockRecordingAndroidBridge = () => {
    const messages: any[] = [];
    win.androidBridge = {
      postMessage: (m) => {
        messages.push(JSON.parse(m));
      },
    };
    return messages;
  };

  const emitNativeEvent = (callbackId: string, data: unknown) => {
    (win as any).Capacitor.fromNative({ callbackId, methodName: 'addListener', success: true, data });
  };

  const mockAndroidPlugin = (pluginClassName: string, methodName: string) => {
    const w: any = win;
    w.Capacitor = w.Capacitor ?? {};
    w.Capacitor.PluginHeaders = w.Capacitor.PluginHeaders ?? [];
    w.Capacitor.PluginHeaders.push({
      name: pluginClassName,
      methods: [
        { name: methodName, rtype: 'promise' },
        { name: 'addListener' },
        { name: 'removeListener' },
        { name: 'removeAllListeners' },
      ],
    });
  };
});

interface AwesomePlugin extends Plugin {
  mph(): Promise<number>;
}
