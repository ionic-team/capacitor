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
    jsImplementations: PluginImplementations,
  ): any => {
    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation: any;

    const loadJavaScriptImplementation = async (): Promise<any> => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation =
          typeof jsImplementations[platform] === 'function'
            ? (jsImplementation = await jsImplementations[platform]())
            : (jsImplementation = jsImplementations[platform]);
      }

      return jsImplementation;
    };

    const loadJavaScriptImplementationMethod = (
      impl: any,
      prop: PropertyKey,
    ): any => {
      if (impl) {
        return impl[prop]?.bind(impl);
      } else if (pluginHeader) {
        const methodHeader = pluginHeader.methods.find(m => prop === m.name);

        if (methodHeader) {
          if (methodHeader.rtype === 'promise') {
            return (options: any) =>
              cap.nativePromise(pluginName, prop.toString(), options);
          } else {
            return (options: any, callback: any) =>
              cap.nativeCallback(
                pluginName,
                prop.toString(),
                options,
                callback,
              );
          }
        }
      }
    };

    const createPluginMethodWrapper = (prop: PropertyKey) => {
      const wrapper = async (...args: any[]) => {
        const impl = await loadJavaScriptImplementation();
        const fn = loadJavaScriptImplementationMethod(impl, prop);

        if (fn) {
          return fn(...args);
        } else {
          throw new CapacitorException(
            `"${pluginName}.${
              prop as any
            }()" is not implemented on ${platform}`,
            ExceptionCode.Unimplemented,
          );
        }
      };

      // Some flair ✨
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, 'name', {
        value: prop,
        writable: false,
      });

      return wrapper;
    };

    const addListener = createPluginMethodWrapper('addListener');
    const removeListener = createPluginMethodWrapper('removeListener');
    const addListenerWrapper = (eventName: string, callback: any) => {
      const call = addListener({ eventName }, callback);
      const remove = async () => {
        const callbackId = await call;

        removeListener(
          {
            eventName,
            callbackId,
          },
          callback,
        );
      };

      const p = new Promise(resolve => call.then(() => resolve({ remove })));

      Object.defineProperty(p, 'remove', {
        value: async () => {
          console.warn(
            `Calling 'remove' on a synchronous response from addListener() is deprecated.`,
          );

          remove();
        },
      });

      return p;
    };

    const proxy = new Proxy(
      {},
      {
        get(_, prop) {
          switch (prop) {
            // https://github.com/facebook/react/issues/20030
            case '$$typeof':
              return undefined;
            case 'addListener':
              return addListenerWrapper;
            case 'removeListener':
              return removeListener;
            default:
              return createPluginMethodWrapper(prop);
          }
        },
      },
    );

    Plugins[pluginName] = proxy;

    return proxy;
  };

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
