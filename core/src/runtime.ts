import type {
  CapacitorInstance,
  PluginRegistry,
  ExceptionCode,
  InternalState,
  GlobalInstance,
} from './definitions';
import { convertFileSrcServerUrl, noop, uuidv4 } from './util';
import { initBridge } from './bridge';
import { initEvents } from './events';
import { initLegacy } from './legacy/legacy';
import { initPluginRegistry } from './plugins';
import { initVendor } from './vendor';

export const createCapacitor = (gbl: GlobalInstance) => {
  const state: InternalState = {
    platform: 'web',
    isNative: false,
  };

  const Plugins: PluginRegistry = {} as any;

  const getPlatform = () => state.platform;

  const isNativePlatform = () => state.isNative;

  const isPluginAvailable = (pluginName: string) =>
    Object.prototype.hasOwnProperty.call(Plugins, pluginName);

  const convertFileSrc = (filePath: string) =>
    convertFileSrcServerUrl(gbl.WEBVIEW_SERVER_URL, filePath);

  const pluginMethodNoop = (
    _target: any,
    prop: PropertyKey,
    pluginName: string,
  ) => {
    return Promise.reject(
      `${pluginName} does not have an implementation of "${prop as any}".`,
    );
  };

  const instance: CapacitorInstance = {
    convertFileSrc,
    getPlatform,
    isNativePlatform,
    isPluginAvailable,
    registerPlugin: initPluginRegistry(state),
    Plugins,
    pluginMethodNoop,
    withPlugin: noop,
    uuidv4,
    Exception: CapacitorException,
  };

  initPluginProxy(instance);
  initBridge(gbl, instance, state);
  initEvents(gbl, instance);
  initVendor(gbl, instance);
  initLegacy(gbl, instance, state);

  return instance;
};

const initPluginProxy = (instance: CapacitorInstance) => {
  // Gracefully degrade in non-Proxy supporting engines, e.g. IE11. This
  // effectively means that trying to access an unavailable plugin will
  // locally throw, but this is still better than throwing a syntax error.
  if (typeof Proxy !== 'undefined') {
    // Build a proxy for the Plugins object that returns the "Noop Plugin"
    // if a plugin isn't available
    instance.Plugins = new Proxy<any>(instance.Plugins, {
      get(Plugins, pluginName) {
        if (typeof Plugins[pluginName] === 'undefined') {
          return new Proxy<any>(
            {},
            {
              get(target, prop) {
                if (typeof target[prop] === 'undefined') {
                  return instance.pluginMethodNoop(target, prop, pluginName);
                }
                return target[prop];
              },
            },
          );
        }
        return Plugins[pluginName];
      },
    });
  }
};

class CapacitorException extends Error {
  constructor(readonly message: string, readonly code: ExceptionCode) {
    super(message);
  }
}
