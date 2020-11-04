import type { CapacitorInstance, GlobalInstance } from '../definitions';
import { legacyRegisterWebPlugin } from '../legacy/legacy-web-plugin-merge';
import { createCapacitor } from '../runtime';
import { noop } from '../util';
import { WebPlugin } from '../web-plugin';

describe('legacy', () => {
  let instance: CapacitorInstance;
  let gbl: GlobalInstance;
  const LegacyWebPlugin = class extends WebPlugin {};
  const orgConsoleWarn = console.warn;

  beforeAll(() => {
    console.warn = noop;
  });

  afterAll(() => {
    console.warn = orgConsoleWarn;
  });

  it('registerWebPlugin() when native implementation already provided, and same platform config provided', () => {
    gbl = {
      androidBridge: { postMessage: noop },
    };
    instance = createCapacitor(gbl);

    const MockNativePlugin = {} as any;
    instance.Plugins['Legacy'] = MockNativePlugin;

    const Legacy = new LegacyWebPlugin({
      name: 'Legacy',
      platforms: ['android'],
    });
    legacyRegisterWebPlugin(instance, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(instance.Plugins['Legacy']).toBe(Legacy);
  });

  it('do not registerWebPlugin() when native implementation already provided', () => {
    gbl = {
      androidBridge: { postMessage: noop },
    };
    instance = createCapacitor(gbl);

    const MockNativePlugin = {} as any;
    instance.Plugins['Legacy'] = MockNativePlugin;

    const Legacy = new LegacyWebPlugin({ name: 'Legacy' });
    legacyRegisterWebPlugin(instance, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(instance.Plugins['Legacy']).toBe(MockNativePlugin);
  });

  it('registerWebPlugin() when platforms provided and no native implementation', () => {
    gbl = {};
    instance = createCapacitor(gbl);

    const Legacy = new LegacyWebPlugin({ name: 'Legacy', platforms: ['web'] });
    legacyRegisterWebPlugin(instance, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(instance.Plugins['Legacy']).toBe(Legacy);
  });

  it('registerWebPlugin() when platforms not provided and no native implementation', () => {
    gbl = {};
    instance = createCapacitor(gbl);

    const Legacy = new LegacyWebPlugin({ name: 'Legacy' });
    legacyRegisterWebPlugin(instance, Legacy);

    expect(Legacy.config.name).toBe('Legacy');
    expect(instance.Plugins['Legacy']).toBe(Legacy);
  });

  it('error registerWebPlugin() w/out config.name', () => {
    gbl = {};
    instance = createCapacitor(gbl);

    expect(() => {
      legacyRegisterWebPlugin(instance, new LegacyWebPlugin({} as any));
    }).toThrowError(
      'Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."',
    );
  });

  it('error registerWebPlugin() w/out config', () => {
    gbl = {};
    instance = createCapacitor(gbl);

    expect(() => {
      legacyRegisterWebPlugin(instance, new LegacyWebPlugin());
    }).toThrowError(
      'Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."',
    );
  });

  it('add navigator.app.exitApp', () => {
    gbl = {
      navigator: {},
    };
    instance = createCapacitor(gbl);
    expect(gbl.navigator.app.exitApp).toBeDefined();
  });

  it('cordova global', () => {
    gbl = {};
    instance = createCapacitor(gbl);
    expect(gbl.cordova).toBeDefined();
  });

  it('use existing cordova global', () => {
    const existingCordova: any = {};
    gbl = {
      cordova: existingCordova,
    };
    instance = createCapacitor(gbl);
    expect(gbl.cordova).toBe(existingCordova);
  });

  it('deprecated props', () => {
    expect((instance as any).platform).toBe('web');
    expect((instance as any).isNative).toBe(false);
  });
});
