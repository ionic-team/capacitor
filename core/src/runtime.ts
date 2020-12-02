import { getPlatformId, initBridge } from './bridge';
import type { CapacitorGlobal, PluginImplementations } from './definitions';
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
} from './util';
import { initVendor } from './vendor';

export const createCapacitor = (win: WindowCapacitor): CapacitorInstance => {
  const cap: CapacitorInstance = win.Capacitor || ({} as any);

  const Plugins = (cap.Plugins = cap.Plugins || ({} as any));

  const webviewServerUrl =
    typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';

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

  // ensure we do not double proxy the same plugin
  const registeredPlugins = new Map<string, any>();

  const registerPlugin = (
    pluginName: string,
    impls: PluginImplementations = {},
  ): any => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      return registeredPlugin;
    }

    const nativePluginImpl = Plugins[pluginName];
    if (nativePluginImpl) {
      // the native implementation is already on the global
      // return a proxy that'll also handle any missing methods
      // convert the Capacitor.Plugins.PLUGIN into a proxy and return it
      const nativePluginProxy = (Plugins[pluginName] = new Proxy<any>(
        {},
        {
          get(_, prop) {
            if (typeof (nativePluginImpl as any)[prop] === 'function') {
              // call the plugin method, Plugin.method(args)
              // platform implementation already ready to go
              return (nativePluginImpl as any)[prop];
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
      registeredPlugins.set(pluginName, nativePluginProxy);
      return nativePluginProxy;
    }

    let loadedImpl: any = null;
    let lazyLoadingImpl: Promise<any> = null;

    // there isn't a native implementation already on the global
    // create a Proxy which is used to lazy load implementations
    const pluginProxy = (Plugins[pluginName] = new Proxy<any>(
      {},
      {
        get(_, prop) {
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
              if (typeof (loadedImpl as any)[prop] === 'function') {
                return (...args: any[]) => loadedImpl[prop](...args);
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
                    loadedRtn = loadedImpl[prop](...args);
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
                    return loadedImpl[prop]();
                  });
                };
              }

              return (...args: any[]) => {
                return lazyLoadingImpl.then(lazyLoadedImpl => {
                  // implementation is now loaded and has the methd to call ready
                  loadedImpl = lazyLoadedImpl;

                  if (typeof loadedImpl[prop] === 'function') {
                    return loadedImpl[prop](...args);
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
    registeredPlugins.set(pluginName, pluginProxy);
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
