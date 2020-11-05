import { getPlatformId, initBridge } from './bridge';
import type {
  CapacitorGlobal,
  PluginCallback,
  PluginImplementations,
  PluginListenerHandle,
} from './definitions';
import type {
  CapacitorInstance,
  WindowCapacitor,
} from './definitions-internal';
import { initEvents } from './events';
import { initLegacyHandlers } from './legacy/legacy-handlers';
import {
  CapacitorException,
  convertFileSrcServerUrl,
  ExceptionCode,
  NativePlugin,
  noop,
  uuidv4,
} from './util';
import { initVendor } from './vendor';

export const createCapacitor = (win: WindowCapacitor): CapacitorInstance => {
  const webviewServerUrl =
    typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';

  const Plugins = win?.Capacitor?.Plugins || ({} as any);

  const getPlatform = () => getPlatformId(win);

  const isNativePlatform = () => getPlatformId(win) !== 'web';

  const isPluginAvailable = (pluginName: string) =>
    Object.prototype.hasOwnProperty.call(Plugins, pluginName);

  const convertFileSrc = (filePath: string) =>
    convertFileSrcServerUrl(webviewServerUrl, filePath);

  const logJs = (msg: string, level: 'error' | 'warn' | 'info' | 'log') => {
    switch (level) {
      case 'error':
        win.console.error(msg);
        break;
      case 'warn':
        win.console.warn(msg);
        break;
      case 'info':
        win.console.info(msg);
        break;
      default:
        win.console.log(msg);
    }
  };

  const handleError = (e: Error) => win.console.error(e);

  const pluginMethodNoop = (
    _target: any,
    prop: PropertyKey,
    pluginName: string,
  ) => {
    return Promise.reject(
      `${pluginName} does not have an implementation of "${prop as any}".`,
    );
  };

  const cap: CapacitorInstance = {
    convertFileSrc,
    getPlatform,
    handleError,
    isNativePlatform,
    isPluginAvailable,
    logJs,
    pluginMethodNoop,
    Plugins,
    withPlugin: noop,
    uuidv4,
    getServerUrl: () => webviewServerUrl,
    Exception: CapacitorException,
    DEBUG: !!win?.Capacitor?.DEBUG,
    // values to be set later
    logFromNative: null,
    logToNative: null,
    handleWindowError: null,
    registerPlugin: null,
  };

  cap.registerPlugin = (
    pluginName: string,
    impls: PluginImplementations,
  ): any => {
    const platform = getPlatform();
    const pltImplementation = impls[platform];

    if (pltImplementation === NativePlugin) {
      // using NativePlugin symbol to identify that the native build
      // would have already placed the JS methods on the global
      // Capacitor.Plugins.PLUGINNAME.method();
      const nativePluginImpl = cap.Plugins[pluginName];

      if (nativePluginImpl != null) {
        // the native implementation is already on the global
        // return a proxy that'll also handle any missing methods
        return new Proxy<any>(
          {},
          {
            get(_, prop) {
              if (typeof (nativePluginImpl as any)[prop] === 'function') {
                // call the plugin method, Plugin.method(args)
                // platform implementation already ready to go
                return (nativePluginImpl as any)[prop];
              }

              throw new cap.Exception(
                `"${pluginName}" plugin for "${platform}" implementation missing "${
                  prop as any
                }" method`,
                ExceptionCode.Unimplemented,
              );
            },
          },
        );
      }

      throw new cap.Exception(
        `"${pluginName}" plugin missing from "${platform}" implementation`,
        ExceptionCode.Unimplemented,
      );
    }

    // there isn't a native implementation already on the global
    // create a Proxy which is used to lazy load the implementation
    const listenerHandles: PluginListenerHandle[] = [];
    return new Proxy<any>(
      {},
      {
        get(_, prop) {
          // proxy getter for any call on this plugin object

          const platform = getPlatform();
          const pltImplementation = impls[platform];

          if (prop === 'addListener') {
            // Plugin.addListener()
            // does not return a promise
            return (eventName: string, callback: PluginCallback) => {
              const listenerHandle = cap.addListener(
                pluginName,
                eventName,
                callback,
              );
              listenerHandles.push(listenerHandle);
              return listenerHandle;
            };
          }

          if (prop === 'removeAllListeners') {
            // Plugin.removeAllListeners()
            // does not return a promise
            return () => {
              listenerHandles.forEach(h => h.remove());
              listenerHandles.length = 0;
            };
          }

          if (pltImplementation != null) {
            if (typeof pltImplementation === 'function') {
              // implementation loader fn returning a promise
              // probably something like () => import('./web.js')
              return (...args: any[]) => {
                // begin lazy load the platform's implementation module
                return pltImplementation().then((loadedImpl: any) => {
                  // platform implementation now loaded
                  // replace the implementation loader fn w/ the loaded module
                  impls[platform] = loadedImpl;
                  if (typeof (loadedImpl as any)[prop] === 'function') {
                    return (loadedImpl as any)[prop].apply(loadedImpl, args);
                  }
                  throw new cap.Exception(
                    `"${pluginName}" plugin implementation missing "${
                      prop as any
                    }"`,
                    ExceptionCode.Unimplemented,
                  );
                });
              };
            }

            if (typeof (pltImplementation as any)[prop] === 'function') {
              // call the plugin method, Plugin.method(args)
              // platform implementation already loaded and module ready to go
              return (...args: any[]) => {
                return (pltImplementation as any)[prop].apply(
                  pltImplementation,
                  args,
                );
              };
            }

            throw new cap.Exception(
              `"${pluginName}" plugin implementation missing "${
                prop as any
              }" method`,
              ExceptionCode.Unimplemented,
            );
          }

          throw new cap.Exception(
            `"${pluginName}" plugin implementation not available for "${platform}"`,
            ExceptionCode.Unimplemented,
          );
        },
      },
    );
  };

  initBridge(win, cap);
  initEvents(win, cap);
  initVendor(win, cap);
  initLegacyHandlers(win, cap);

  return cap;
};

export const initCapacitorGlobal = (win: any): CapacitorGlobal =>
  (win.Capacitor = createCapacitor(win));
