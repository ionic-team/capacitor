import { initBridge } from './bridge';
import type {
  CapacitorInstance,
  ExceptionCode,
  InternalState,
  GlobalInstance,
} from './definitions';
import { initEvents } from './events';
import { initLegacyHandlers } from './legacy/legacy-handlers';
import { initPluginProxy, initPluginRegister } from './plugins';
import { convertFileSrcServerUrl, noop, uuidv4 } from './util';
import { initVendor } from './vendor';

export const createCapacitor = (gbl: GlobalInstance): CapacitorInstance => {
  const state: InternalState = {
    platform: 'web',
    isNative: false,
    plugins: {} as any,
  };

  const getPlatform = () => state.platform;

  const isNativePlatform = () => state.isNative;

  const isPluginAvailable = (pluginName: string) =>
    Object.prototype.hasOwnProperty.call(state.plugins, pluginName);

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
    registerPlugin: null,
    Plugins: null,
    pluginMethodNoop,
    withPlugin: noop,
    uuidv4,
    Exception: CapacitorException,
  };

  initPluginRegister(instance, state);
  initPluginProxy(instance, state);
  initBridge(gbl, instance, state);
  initEvents(gbl, instance);
  initVendor(gbl, instance);
  initLegacyHandlers(gbl, instance, state);

  return instance;
};

class CapacitorException extends Error {
  constructor(readonly message: string, readonly code: ExceptionCode) {
    super(message);
  }
}
