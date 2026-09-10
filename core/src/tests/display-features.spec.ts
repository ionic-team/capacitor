/**
 * @jest-environment jsdom
 */

import { initBridge } from '../../native-bridge';
import type { DisplayFeaturesPlugin, DisplayFeaturesState } from '../core-plugins';
import { DisplayFeaturesPluginWeb } from '../core-plugins';
import type { CapacitorGlobal } from '../definitions';
import type { WindowCapacitor, CapacitorInstance } from '../definitions-internal';
import { initCapacitorGlobal } from '../runtime';
import { ExceptionCode } from '../util';

describe('DisplayFeatures', () => {
  let win: WindowCapacitor;
  let cap: CapacitorGlobal;

  const nativeState: DisplayFeaturesState = {
    supported: false,
    pose: 'unknown',
    activeDisplay: 'unknown',
    horizontalSizeClass: 'compact',
    verticalSizeClass: 'regular',
    reservedRegions: [],
    safeAreaInsets: { top: 59, left: 0, bottom: 34, right: 0 },
    bounds: { width: 393, height: 852 },
  };

  beforeEach(() => {
    win = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.setImmediate = global.setTimeout;
  });

  it('getDisplayFeatures proxies to the native implementation and returns its result untouched', async () => {
    mockNativeBridge();
    initBridge(win);
    mockNativePlugin('DisplayFeatures', 'getDisplayFeatures');

    cap = initCapacitorGlobal(win);

    const calls: { pluginName: string; methodName: string; options: any }[] = [];
    (cap as CapacitorInstance).nativePromise = async (pluginName, methodName, options) => {
      calls.push({ pluginName, methodName, options });
      return nativeState as any;
    };

    const DisplayFeatures = cap.registerPlugin<DisplayFeaturesPlugin>('DisplayFeatures', {
      web: () => new DisplayFeaturesPluginWeb(),
    });

    const state = await DisplayFeatures.getDisplayFeatures();

    expect(calls).toHaveLength(1);
    expect(calls[0].pluginName).toBe('DisplayFeatures');
    expect(calls[0].methodName).toBe('getDisplayFeatures');
    expect(state).toEqual(nativeState);
  });

  it('addListener on native returns a removable handle for displayFeaturesChanged', async () => {
    mockNativeBridge();
    initBridge(win);
    mockNativePlugin('DisplayFeatures', 'getDisplayFeatures');

    cap = initCapacitorGlobal(win);

    const DisplayFeatures = cap.registerPlugin<DisplayFeaturesPlugin>('DisplayFeatures', {
      web: () => new DisplayFeaturesPluginWeb(),
    });

    const handle = await DisplayFeatures.addListener('displayFeaturesChanged', () => {
      // ignore
    });

    expect(handle).toBeDefined();
    expect(typeof handle.remove).toBe('function');
  });

  it('delivers displayFeaturesChanged state to listeners', async (done) => {
    const NativeLike = class {
      async addListener(_eventName: string, fn: (state: DisplayFeaturesState) => void) {
        fn(nativeState);
      }
    };

    cap = initCapacitorGlobal(win);
    const DisplayFeatures = cap.registerPlugin<DisplayFeaturesPlugin>('DisplayFeatures', {
      web: async () => new NativeLike(),
    });

    DisplayFeatures.addListener('displayFeaturesChanged', (state) => {
      try {
        expect(state).toEqual(nativeState);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('rejects as unavailable on web', async (done) => {
    cap = initCapacitorGlobal(win);
    expect(cap.getPlatform()).toBe('web');

    const DisplayFeatures = cap.registerPlugin<DisplayFeaturesPlugin>('DisplayFeatures', {
      web: () => new DisplayFeaturesPluginWeb(),
    });

    try {
      await DisplayFeatures.getDisplayFeatures();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe('not available for web');
      expect(e.code).toBe(ExceptionCode.Unavailable);
      done();
    }
  });

  it('rejects as unimplemented on a native platform without the plugin', async (done) => {
    // No native plugin header registered: this is the Android state for this
    // plugin today (iOS-only first increment).
    mockNativeBridge();
    initBridge(win);

    cap = initCapacitorGlobal(win);

    const DisplayFeatures = cap.registerPlugin<DisplayFeaturesPlugin>('DisplayFeatures', {
      web: () => new DisplayFeaturesPluginWeb(),
    });

    try {
      await DisplayFeatures.getDisplayFeatures();
      done('did not throw');
    } catch (e) {
      expect(e.message).toBe(`"DisplayFeatures" plugin is not implemented on android`);
      expect(e.code).toBe(ExceptionCode.Unimplemented);
      done();
    }
  });

  // The native bridge mocks mirror plugin.spec.ts. The JS proxy is platform
  // agnostic: the same code path serves the iOS plugin added in this change.
  const mockNativeBridge = () => {
    win.androidBridge = {
      postMessage: () => {
        // ignore
      },
    };
  };

  const mockNativePlugin = (pluginClassName: string, methodName: string) => {
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
