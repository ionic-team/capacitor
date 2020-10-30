import type { CapacitorInstance, GlobalInstance } from '../definitions';
import { createCapacitor, initGlobal } from '../runtime';

describe('runtime', () => {
  let instance: CapacitorInstance;
  let gbl: GlobalInstance;

  beforeEach(() => {
    gbl = {};
  });

  it('default methods/props', () => {
    instance = createCapacitor(gbl);
    expect(instance.getPlatform()).toBe('web');
    expect(instance.isNativePlatform()).toBe(false);
    expect(instance.isPluginAvailable('Nope')).toBe(false);
  });

  it('used existing window.Capacitor.Plugins', () => {
    gbl.Capacitor = {
      Plugins: { Awesome: {} },
    } as any;
    instance = createCapacitor(gbl);
    expect(instance.isPluginAvailable('Awesome')).toBe(true);
    expect(instance.isPluginAvailable('Nope')).toBe(false);
  });

  it('existing Capacitor global replaced', () => {
    const old = (gbl.Capacitor = {} as any);
    instance = initGlobal(gbl);
    expect(gbl.Capacitor).toBe(instance);
    expect(gbl.Capacitor).not.toBe(old);
  });

  it('new Capacitor global created', () => {
    instance = initGlobal(gbl);
    expect(gbl.Capacitor).toBe(instance);
  });

  it('DEBUG false default', () => {
    instance = createCapacitor(gbl);
    expect(instance.DEBUG).toBe(false);
  });

  it('DEBUG set from window.Capacitor.DEBUG', () => {
    (gbl as any).Capacitor = {
      DEBUG: true,
    };
    instance = createCapacitor(gbl);
    expect(instance.DEBUG).toBe(true);
  });

  it('server url set from window.WEBVIEW_SERVER_URL', () => {
    gbl.WEBVIEW_SERVER_URL = 'whatever://home';
    instance = createCapacitor(gbl);
    expect(instance.getServerUrl()).toBe('whatever://home');
  });

  it('server url default w/out window.WEBVIEW_SERVER_URL', () => {
    instance = createCapacitor(gbl);
    expect(instance.getServerUrl()).toBe('/');
  });

  it('server url setServerUrl', () => {
    instance.setServerUrl('whatever://home');
    expect(instance.getServerUrl()).toBe('whatever://home');
  });
});
