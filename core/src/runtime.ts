import type { CapacitorGlobal, PluginImplementations } from './definitions';
import type {
  CapacitorCustomPlatformInstance,
  CapacitorInstance,
  PluginHeader,
  WindowCapacitor,
} from './definitions-internal';
import type { CapacitorPlatformsInstance } from './platforms';
import { CapacitorException, getPlatformId, ExceptionCode } from './util';

export interface RegisteredPlugin {
  readonly name: string;
  readonly proxy: any;
  readonly platforms: ReadonlySet<string>;
}

export const createCapacitor = (win: WindowCapacitor): CapacitorInstance => {
  const capCustomPlatform: CapacitorCustomPlatformInstance =
    win.CapacitorCustomPlatform || null;
  const cap: CapacitorInstance = win.Capacitor || ({} as any);
  const Plugins = (cap.Plugins = cap.Plugins || ({} as any));
  /**
   * @deprecated Use `capCustomPlatform` instead, default functions like registerPlugin will function with the new object.
   */
  const capPlatforms: CapacitorPlatformsInstance = win.CapacitorPlatforms;

  const defaultGetPlatform = () => {
    return capCustomPlatform !== null
      ? capCustomPlatform.name
      : getPlatformId(win);
  };
  const getPlatform =
    capPlatforms?.currentPlatform?.getPlatform || defaultGetPlatform;

  const defaultIsNativePlatform = () => getPlatform() !== 'web';
  const isNativePlatform =
    capPlatforms?.currentPlatform?.isNativePlatform || defaultIsNativePlatform;

  const defaultIsPluginAvailable = (pluginName: string): boolean => {
    const plugin = registeredPlugins.get(pluginName);

    if (plugin?.platforms.has(getPlatform())) {
      // JS implementation available for the current platform.
      return true;
    }

    if (getPluginHeader(pluginName)) {
      // Native implementation available.
      return true;
    }

    return false;
  };
  const isPluginAvailable =
    capPlatforms?.currentPlatform?.isPluginAvailable ||
    defaultIsPluginAvailable;

  const defaultGetPluginHeader = (
    pluginName: string,
  ): PluginHeader | undefined =>
    cap.PluginHeaders?.find(h => h.name === pluginName);
  const getPluginHeader =
    capPlatforms?.currentPlatform?.getPluginHeader || defaultGetPluginHeader;

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

  const registeredPlugins = new Map<string, RegisteredPlugin>();

  const defaultRegisterPlugin = (
    pluginName: string,
    jsImplementations: PluginImplementations = {},
  ): any => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      console.warn(
        `Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`,
      );

      return registeredPlugin.proxy;
    }

    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation: any;

    const loadPluginImplementation = async (): Promise<any> => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation =
          typeof jsImplementations[platform] === 'function'
            ? (jsImplementation = await jsImplementations[platform]())
            : (jsImplementation = jsImplementations[platform]);
      } else if (
        capCustomPlatform !== null &&
        !jsImplementation &&
        'web' in jsImplementations
      ) {
        jsImplementation =
          typeof jsImplementations['web'] === 'function'
            ? (jsImplementation = await jsImplementations['web']())
            : (jsImplementation = jsImplementations['web']);
      }

      return jsImplementation;
    };

    const createPluginMethod = (
      impl: any,
      prop: PropertyKey,
    ): ((...args: any[]) => any) => {
      if (pluginHeader) {
        const methodHeader = pluginHeader?.methods.find(m => prop === m.name);
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
        } else if (impl) {
          return impl[prop]?.bind(impl);
        }
      } else if (impl) {
        return impl[prop]?.bind(impl);
      } else {
        throw new CapacitorException(
          `"${pluginName}" plugin is not implemented on ${platform}`,
          ExceptionCode.Unimplemented,
        );
      }
    };

    const createPluginMethodWrapper = (prop: PropertyKey) => {
      let remove: (() => void) | undefined;
      const wrapper = (...args: any[]) => {
        const p = loadPluginImplementation().then(impl => {
          const fn = createPluginMethod(impl, prop);

          if (fn) {
            const p = fn(...args);
            remove = p?.remove;
            return p;
          } else {
            throw new CapacitorException(
              `"${pluginName}.${
                prop as any
              }()" is not implemented on ${platform}`,
              ExceptionCode.Unimplemented,
            );
          }
        });

        if (prop === 'addListener') {
          (p as any).remove = async () => remove();
        }

        return p;
      };

      // Some flair ✨
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, 'name', {
        value: prop,
        writable: false,
        configurable: false,
      });

      return wrapper;
    };

    const addListener = createPluginMethodWrapper('addListener');
    const removeListener = createPluginMethodWrapper('removeListener');
    const addListenerNative = (eventName: string, callback: any) => {
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

      (p as any).remove = async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      };

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
            case 'toJSON':
              return () => ({});
            case 'addListener':
              return pluginHeader ? addListenerNative : addListener;
            case 'removeListener':
              return removeListener;
            default:
              return createPluginMethodWrapper(prop);
          }
        },
      },
    );

    Plugins[pluginName] = proxy;

    registeredPlugins.set(pluginName, {
      name: pluginName,
      proxy,
      platforms: new Set([
        ...Object.keys(jsImplementations),
        ...(pluginHeader ? [platform] : []),
      ]),
    });

    return proxy;
  };
  const registerPlugin =
    capPlatforms?.currentPlatform?.registerPlugin || defaultRegisterPlugin;

  // Add in convertFileSrc for web, it will already be available in native context
  if (!cap.convertFileSrc) {
    cap.convertFileSrc = filePath => filePath;
  }

  cap.getPlatform = getPlatform;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;
  cap.isLoggingEnabled = !!cap.isLoggingEnabled;

  // Deprecated props
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();

  return cap;
};

export const initCapacitorGlobal = (win: any): CapacitorGlobal =>
  (win.Capacitor = createCapacitor(win));
