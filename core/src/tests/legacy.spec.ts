import { initBridge } from '../../native-bridge';
import { legacyRegisterWebPlugin } from '../legacy/legacy-web-plugin-merge';
import { createCapacitor } from '../runtime';
import { WebPlugin } from '../web-plugin';

import type { CapacitorGlobal } from '../definitions';
import type { WindowCapacitor } from '../definitions-internal';

describe('legacy', () => {
  let win: WindowCapacitor;
  let cap: CapacitorGlobal;
  const LegacyWebPlugin = class extends WebPlugin {};
  const orgConsoleWarn = console.warn;
  const noop = () => {
    // do nothing
  };

  beforeAll(() => {
    console.warn = noop;
    win = {};
    initBridge(win);
  });

  afterAll(() => {
    console.warn = orgConsoleWarn;
  });

  it('registerWebPlugin() when native implementation already provided, and same platform config provided', () => {
    win = {
      androidBridge: { postMessage: noop },
    };
    cap = createCapacitor(win) as any;

    const MockNativePlugin = {} as any;
    cap.Plugins['Legacy'] = MockNativePlugin;

    const Legacy = new LegacyWebPlugin({
      name: 'Legacy',
      platforms: ['android'],
    });
    legacyRegisterWebPlugin(cap, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(cap.Plugins['Legacy']).toBe(Legacy);
  });

  it('do not registerWebPlugin() when native implementation already provided', () => {
    win = {
      androidBridge: { postMessage: noop },
    };
    cap = createCapacitor(win) as any;

    const MockNativePlugin = {} as any;
    cap.Plugins['Legacy'] = MockNativePlugin;

    const Legacy = new LegacyWebPlugin({ name: 'Legacy' });
    legacyRegisterWebPlugin(cap, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(cap.Plugins['Legacy']).toBe(MockNativePlugin);
  });

  it('registerWebPlugin() when platforms provided and no native implementation', () => {
    win = {};
    cap = createCapacitor(win) as any;

    const Legacy = new LegacyWebPlugin({ name: 'Legacy', platforms: ['web'] });
    legacyRegisterWebPlugin(cap, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(cap.Plugins['Legacy']).toBe(Legacy);
  });

  it('registerWebPlugin() when platforms not provided and no native implementation', () => {
    win = {};
    cap = createCapacitor(win) as any;

    const Legacy = new LegacyWebPlugin({ name: 'Legacy' });
    legacyRegisterWebPlugin(cap, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(cap.Plugins['Legacy']).toBe(Legacy);
  });

  it('error registerWebPlugin() w/out config.name', async () => {
    win = {};
    cap = createCapacitor(win) as any;

    expect(() => {
      legacyRegisterWebPlugin(cap, new LegacyWebPlugin({} as any));
    }).toThrowError(
      'Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."',
    );
  });

  it('error registerWebPlugin() w/out config', async () => {
    win = {};
    cap = createCapacitor(win) as any;

    expect(() => {
      legacyRegisterWebPlugin(cap, new LegacyWebPlugin());
    }).toThrowError(
      'Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."',
    );
  });

  it('doc.addEventListener backbutton', done => {
    const AppWeb = class {
      async addListener(eventName: string) {
        expect(eventName).toBe('backButton');
        done();
      }
    };
    const bbCallback = () => {
      // ignore
    };
    win = {
      document: {
        addEventListener(eventName: string) {
          expect(eventName).toBe('backbutton');
        },
      },
      androidBridge: { postMessage: noop },
    };
    initBridge(win);
    cap = createCapacitor(win);
    cap.registerPlugin<any>('App', {
      web: new AppWeb(),
      android: new AppWeb(),
    });

    win.document.addEventListener('backbutton', bbCallback);
  });

  it('doc.addEventListener deviceready', done => {
    win = {
      document: {
        addEventListener() {
          // ignore
        },
      },
      androidBridge: { postMessage: noop },
    };
    initBridge(win);
    createCapacitor(win);
    win.document.addEventListener('deviceready', done);
  });

  it('add navigator.app.exitApp', () => {
    win = {
      navigator: {},
      androidBridge: { postMessage: noop },
    };
    initBridge(win);
    createCapacitor(win);
    expect(win.navigator.app.exitApp).toBeDefined();
  });

  it('cordova global', () => {
    win = {
      androidBridge: { postMessage: noop },
    };
    initBridge(win);
    createCapacitor(win);
    expect(win.cordova).toBeDefined();
  });

  it('use existing cordova global', () => {
    const existingCordova: any = {};
    win = {
      cordova: existingCordova,
    };
    initBridge(win);
    createCapacitor(win);
    expect(win.cordova).toBe(existingCordova);
  });

  it('deprecated props', () => {
    cap = createCapacitor(win) as any;
    expect((cap as any).platform).toBe('web');
    expect((cap as any).isNative).toBe(false);
  });
});
