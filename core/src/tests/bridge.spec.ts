/**
 * @jest-environment jsdom
 */

import { initBridge } from '../../native-bridge';
import type { PluginResult, WindowCapacitor } from '../definitions-internal';

const platforms: [
  name: string,
  setup: (win: WindowCapacitor) => {
    mockPluginResult: (pluginResult: PluginResult) => void;
  },
][] = [
  [
    'ios',
    (win: WindowCapacitor) => {
      const mockPostMessage = jest.fn();
      win.webkit = {
        messageHandlers: {
          bridge: {
            postMessage: mockPostMessage,
          },
        },
      };

      return {
        mockPluginResult: (pluginResult: PluginResult) => {
          mockPostMessage.mockImplementation(m => {
            pluginResult.callbackId = m.callbackId;
            pluginResult.methodName = m.methodName;

            Promise.resolve().then(() =>
              win.Capacitor.fromNative(pluginResult),
            );
          });
        },
      };
    },
  ],
  [
    'android',
    (win: WindowCapacitor) => {
      const mockPostMessage = jest.fn();
      win.androidBridge = {
        postMessage: mockPostMessage,
      };

      return {
        mockPluginResult: (pluginResult: PluginResult) => {
          mockPostMessage.mockImplementation(m => {
            const d = JSON.parse(m);
            pluginResult.callbackId = d.callbackId;
            pluginResult.methodName = d.methodName;

            Promise.resolve().then(() =>
              win.androidBridge.onmessage({
                data: JSON.stringify(pluginResult),
              }),
            );
          });
        },
      };
    },
  ],
];

describe.each(platforms)('%s bridge', (platformName, setup) => {
  let win: WindowCapacitor;
  let mocks: { mockPluginResult: (pluginResult: PluginResult) => void };

  beforeEach(() => {
    win = {};
    mocks = setup(win);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.prompt = () => {};

    initBridge(win);
  });

  it('getPlatform', () => {
    expect(win.Capacitor.getPlatform()).toBe(platformName);
  });

  it('isNativePlatform', () => {
    expect(win.Capacitor.isNativePlatform()).toBe(true);
  });

  it('nativePromise error', done => {
    mocks.mockPluginResult({
      success: false,
      data: null,
      error: { message: 'darn it' },
    });

    win.Capacitor.nativePromise('id', 'method')
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

  it('nativePromise success', done => {
    mocks.mockPluginResult({
      success: true,
      data: { mph: 88 },
    });

    win.Capacitor.nativePromise('id', 'method')
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

  it('nativeCallback w/ callback error', done => {
    mocks.mockPluginResult({
      data: null,
      success: false,
      error: { message: 'darn it' },
    });

    win.Capacitor.nativeCallback(
      'pluginName',
      'methodName',
      {},
      (data, err) => {
        try {
          expect(data).toEqual(null);
          expect(err.message).toBe('darn it');
          done();
        } catch (e) {
          done(e);
        }
      },
    );
  });

  it('nativeCallback w/ options and callback, success', done => {
    mocks.mockPluginResult({
      data: { mph: 88 },
      success: true,
    });

    win.Capacitor.nativeCallback(
      'pluginName',
      'methodName',
      {},
      (data, err) => {
        try {
          expect(data).toEqual({ mph: 88 });
          expect(err).toBe(undefined);
          done();
        } catch (e) {
          done(e);
        }
      },
    );
  });
});
