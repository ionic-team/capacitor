import type {
  CapacitorInstance,
  WindowCapacitor,
} from '../definitions-internal';
import { createCapacitor, initCapacitorGlobal } from '../runtime';

describe('runtime', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;

  beforeEach(() => {
    win = {};
  });

  it('default methods/props', () => {
    cap = createCapacitor(win);
    expect(cap.getPlatform()).toBe('web');
    expect(cap.isNativePlatform()).toBe(false);
    expect(cap.isPluginAvailable('Nope')).toBe(false);
  });

  it('used existing window.Capacitor.Plugins', () => {
    win.Capacitor = {
      Plugins: { Awesome: {} },
    } as any;
    cap = createCapacitor(win);
    expect(cap.isPluginAvailable('Awesome')).toBe(true);
    expect(cap.isPluginAvailable('Nope')).toBe(false);
  });

  it('DEBUG false default', () => {
    cap = createCapacitor(win);
    expect(cap.DEBUG).toBe(false);
  });

  it('DEBUG set from window.Capacitor.DEBUG', () => {
    (win as any).Capacitor = {
      DEBUG: true,
    };
    cap = createCapacitor(win);
    expect(cap.DEBUG).toBe(true);
  });

  it('cannot reset server url after initializing capacitor', () => {
    win.WEBVIEW_SERVER_URL = 'whatever://home';
    cap = createCapacitor(win);
    win.WEBVIEW_SERVER_URL = 'CHANGED!!!';
    expect(cap.getServerUrl()).toBe('whatever://home');
  });

  it('server url set from window.WEBVIEW_SERVER_URL', () => {
    win.WEBVIEW_SERVER_URL = 'whatever://home';
    cap = createCapacitor(win);
    expect(cap.getServerUrl()).toBe('whatever://home');
  });

  it('server url default w/out window.WEBVIEW_SERVER_URL set', () => {
    cap = createCapacitor(win);
    expect(cap.getServerUrl()).toBe('');
  });

  it('new Capacitor global created', () => {
    expect(win.Capacitor).not.toBeDefined();
    cap = initCapacitorGlobal(win) as any;
    expect(win.Capacitor).toBe(cap);
    expect(win.Capacitor.Plugins).toEqual({});
  });

  it('existing Capacitor global updated', () => {
    const Plugins: any = {};
    const old = (win.Capacitor = { Plugins: Plugins } as any);
    cap = initCapacitorGlobal(win) as any;
    expect(win.Capacitor).toBe(cap);
    expect(win.Capacitor).toBe(old);
    expect(win.Capacitor.Plugins).toBe(Plugins);
  });
});
