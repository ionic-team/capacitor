import { getPlatformId, initBridge } from './bridge';
import type { CapacitorGlobal, PluginImplementations } from './definitions';
import type {
  CapacitorInstance,
  PluginHeader,
  WindowCapacitor,
} from './definitions-internal';
import { initEvents } from './events';
import { initLegacyHandlers } from './legacy/legacy-handlers';
import {
  CapacitorException,
  convertFileSrcServerUrl,
  ExceptionCode,
} from './util';
import { initVendor } from './vendor';

export const createCapacitor = (win: WindowCapacitor): CapacitorInstance => {
  const cap: CapacitorInstance = win.Capacitor || ({} as any);

  const Plugins = (cap.Plugins = cap.Plugins || ({} as any));

  const webviewServerUrl =
    typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';

  const getPlatform = () => getPlatformId(win);

  const isNativePlatform = () => getPlatformId(win) !== 'web';

  const isPluginAvailable = (pluginName: string): boolean => {
    const plugin = registeredPlugins.get(pluginName);

    if (plugin && getPlatform() in plugin.implementations) {
      // JS implementation available for the current platform.
      return true;
    }

    if (getPluginHeader(pluginName)) {
      // Native implementation available.
      return true;
    }

    return false;
  };

  const getPluginHeader = (pluginName: string): PluginHeader | undefined =>
    cap.PluginHeaders?.find(h => h.name === pluginName);

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

  const handleError = (err: Error) => win.console.error(err);

  const pluginMethodNoop = (
    _target: any,
    prop: PropertyKey,
    pluginName: string,
  ) => {
    return Promise.reject(
      `${pluginName} does not have an implementation of "${prop as any}".`,
    );
  };

  interface RegisteredPlugin {
    proxy: any;
    implementations: PluginImplementations;
  }

  // ensure we do not double proxy the same plugin
  const registeredPlugins = new Map<string, RegisteredPlugin>();

  const registerPlugin = (
    pluginName: string,
    impls: PluginImplementations = {},
  ): any => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      return registeredPlugin.proxy;
    }

    const nativePluginImpl = Plugins[pluginName];
    if (nativePluginImpl) {
      // the native implementation is already on the global
      // return a proxy that'll also handle any missing methods
      // convert the Capacitor.Plugins.PLUGIN into a proxy and return it
      const nativePluginProxy = (Plugins[pluginName] = new Proxy(
        {},
        {
          get(_, prop) {
            // https://github.com/facebook/react/issues/20030
            if (prop === '$$typeof') {
              return undefined;
            }

            const func = Reflect.get(nativePluginImpl, prop);
            if (typeof func === 'function') {
              // call the plugin method, Plugin.method(args)
              // platform implementation already ready to go
              return func;
            }

            throw new CapacitorException(
              `"${pluginName}.${
                prop as any
              }()" is not implemented on ${getPlatform()}`,
              ExceptionCode.Unimplemented,
            );
          },
        },
      ));
      registeredPlugins.set(pluginName, {
        implementations: impls,
        proxy: nativePluginProxy,
      });
      return nativePluginProxy;
    }

    let loadedImpl: any = null;
    let lazyLoadingImpl: Promise<any> = null;

    // there isn't a native implementation already on the global
    // create a Proxy which is used to lazy load implementations
    const pluginProxy = (Plugins[pluginName] = new Proxy(
      {},
      {
        get(_, prop) {
          // https://github.com/facebook/react/issues/20030
          if (prop === '$$typeof') {
            return undefined;
          }

          // proxy getter for any call on this plugin object
          const platform = getPlatform();
          const pltImplementation = impls[platform];

          if (pltImplementation) {
            // this platform has an implementation we can use

            if (!loadedImpl && !lazyLoadingImpl) {
              // haven't loaded the implementation yet
              if (typeof pltImplementation === 'function') {
                // fn provided to load the implementation
                const loaderRtn = pltImplementation();
                if (loaderRtn) {
                  // received an object from the implementation loader fn
                  if (typeof loaderRtn.then === 'function') {
                    // returned a promise to lazy load the implementation
                    lazyLoadingImpl = loaderRtn;
                  } else {
                    // return the data we need
                    loadedImpl = loaderRtn;
                  }
                }
              } else {
                // given the exact value already
                loadedImpl = pltImplementation;
              }
            }

            if (loadedImpl) {
              // implementation loaded and has the methd to call ready
              const func = Reflect.get(loadedImpl, prop);
              if (typeof func === 'function') {
                return (...args: any[]) =>
                  Reflect.apply(func, loadedImpl, args);
              }
              throw new CapacitorException(
                `"${pluginName}.${
                  prop as any
                }()" is not implemented on ${platform}`,
                ExceptionCode.Unimplemented,
              );
            }

            if (lazyLoadingImpl) {
              // actively lazy loading the implementation
              if (prop === 'addListener') {
                // Plugin.addListener()
                // returns an object with a remove() fn
                return (...args: any[]) => {
                  // doing some lazy loading trickery so we can return
                  // an object, yet still lazy load the implementation
                  let loadedRtn: any = null;
                  lazyLoadingImpl.then(lazyLoadedImpl => {
                    loadedImpl = lazyLoadedImpl;
                    const func = Reflect.get(loadedImpl, prop);
                    loadedRtn = Reflect.apply(func, loadedImpl, args);
                  });
                  return {
                    remove: () => {
                      lazyLoadingImpl.then(lazyLoadedImpl => {
                        loadedImpl = lazyLoadedImpl;
                        if (loadedRtn) {
                          loadedRtn.remove();
                        }
                      });
                    },
                  };
                };
              }

              if (prop === 'removeAllListeners') {
                // Plugin.removeAllListeners()
                // returns void, not a promise
                return () => {
                  lazyLoadingImpl.then(lazyLoadedImpl => {
                    loadedImpl = lazyLoadedImpl;
                    const func = Reflect.get(loadedImpl, prop);
                    return Reflect.apply(func, loadedImpl, []);
                  });
                };
              }

              return (...args: any[]) => {
                return lazyLoadingImpl.then(lazyLoadedImpl => {
                  // implementation is now loaded and has the methd to call ready
                  loadedImpl = lazyLoadedImpl;

                  const func = Reflect.get(loadedImpl, prop);
                  if (typeof func === 'function') {
                    return Reflect.apply(func, loadedImpl, args);
                  }

                  throw new CapacitorException(
                    `"${pluginName}.${
                      prop as any
                    }()" is not implemented on ${platform}`,
                    ExceptionCode.Unimplemented,
                  );
                });
              };
            }
          }

          throw new CapacitorException(
            `"${pluginName}" plugin is not implemented on ${platform}`,
            ExceptionCode.Unimplemented,
          );
        },
      },
    ));
    registeredPlugins.set(pluginName, {
      implementations: impls,
      proxy: pluginProxy,
    });
    return pluginProxy;
  };

  // convert all the existing plugins on the global Capacitor.Plugins
  // object into proxies automatically
  Object.keys(Plugins).forEach(pluginName => registerPlugin(pluginName));

  cap.convertFileSrc = convertFileSrc;
  cap.getPlatform = getPlatform;
  cap.getServerUrl = () => webviewServerUrl;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.logJs = logJs;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;

  initBridge(win, cap);
  initEvents(win, cap);
  initVendor(win, cap);
  initLegacyHandlers(win, cap);

  return cap;
};

export const initCapacitorGlobal = (win: any): CapacitorGlobal =>
  (win.Capacitor = createCapacitor(win));
