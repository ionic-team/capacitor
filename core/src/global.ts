import type { WindowCapacitor } from './definitions-internal';
import type { WebPlugin } from './web-plugin';
import { legacyRegisterWebPlugin } from './legacy/legacy-web-plugin-merge';

const getCapacitorProxy = () => {
  const initialGlobalCapacitor = (typeof globalThis !== 'undefined'
    ? (globalThis as WindowCapacitor)
    : typeof self !== 'undefined'
    ? (self as WindowCapacitor)
    : typeof window !== 'undefined'
    ? (window as WindowCapacitor)
    : (global as WindowCapacitor)
  ).Capacitor || {} as any;

  return new Proxy(
    initialGlobalCapacitor,
    {
      get() {
        const currentGlobalCapacitor = (typeof globalThis !== 'undefined'
          ? (globalThis as WindowCapacitor)
          : typeof self !== 'undefined'
          ? (self as WindowCapacitor)
          : typeof window !== 'undefined'
          ? (window as WindowCapacitor)
          : (global as WindowCapacitor)
        ).Capacitor;
        return currentGlobalCapacitor;
      },
    },
  )
};


export const Capacitor = getCapacitorProxy();

export const registerPlugin = Capacitor.registerPlugin;

/**
 * @deprecated Provided for backwards compatibility for Capacitor v2 plugins.
 * Capacitor v3 plugins should import the plugin directly. This "Plugins"
 * export is deprecated in v3, and will be removed in v4.
 */
export const Plugins = Capacitor.Plugins;

/**
 * Provided for backwards compatibility. Use the registerPlugin() API
 * instead, and provide the web plugin as the "web" implmenetation.
 * For example
 *
 * export const Example = registerPlugin('Example', {
 *   web: () => import('./web').then(m => new m.Example())
 * })
 *
 * @deprecated Deprecated in v3, will be removed from v4.
 */
export const registerWebPlugin = (plugin: WebPlugin): void =>
  legacyRegisterWebPlugin(Capacitor, plugin);
