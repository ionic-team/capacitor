import { initBridge } from './bridge';
import type {
  CapacitorInstance,
  ExceptionCode,
  GlobalInstance,
  InternalState,
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
    plugins: gbl?.Capacitor?.Plugins || ({} as any),
    serverUrl: gbl.WEBVIEW_SERVER_URL || '/',
  };

  const getPlatform = () => state.platform;

  const isNativePlatform = () => state.isNative;

  const isPluginAvailable = (pluginName: string) =>
    Object.prototype.hasOwnProperty.call(state.plugins, pluginName);

  const convertFileSrc = (filePath: string) =>
    convertFileSrcServerUrl(state.serverUrl, filePath);

  const pluginMethodNoop = (
    _target: any,
    prop: PropertyKey,
    pluginName: string,
  ) => {
    return Promise.reject(
      `${pluginName} does not have an implementation of "${prop as any}".`,
    );
  };

  const logJs = (msg: string, level: 'error' | 'warn' | 'info' | 'log') => {
    switch (level) {
      case 'error':
        gbl.console.error(msg);
        break;
      case 'warn':
        gbl.console.warn(msg);
        break;
      case 'info':
        gbl.console.info(msg);
        break;
      default:
        gbl.console.log(msg);
    }
  };

  const handleError = (e: Error) => gbl.console.error(e);

  const instance: CapacitorInstance = {
    convertFileSrc,
    getPlatform,
    handleError,
    isNativePlatform,
    isPluginAvailable,
    logJs,
    pluginMethodNoop,
    withPlugin: noop,
    uuidv4,
    getServerUrl: () => state.serverUrl,
    setServerUrl: url => (state.serverUrl = url),
    Exception: CapacitorException,
    DEBUG: !!gbl?.Capacitor?.DEBUG,
    // values to be set later
    logFromNative: null,
    logToNative: null,
    handleWindowError: null,
    registerPlugin: null,
    Plugins: null,
  };

  initPluginRegister(instance, state);
  initPluginProxy(instance, state);
  initBridge(gbl, instance, state);
  initEvents(gbl, instance);
  initVendor(gbl, instance);
  initLegacyHandlers(gbl, instance, state);

  return instance;
};

export const initGlobal = (gbl: GlobalInstance) =>
  (gbl.Capacitor = createCapacitor(gbl));

class CapacitorException extends Error {
  constructor(readonly message: string, readonly code: ExceptionCode) {
    super(message);
  }
}
