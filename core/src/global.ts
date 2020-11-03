import type { PluginRegistry, RegisterPlugin } from './definitions';
import { initGlobal } from './runtime';

const Capacitor = initGlobal(
  // figure out the current globalThis, such as "window", "self" or "global"
  // ensure errors are not thrown in an node SSR environment or web worker
  (typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : {}) as any,
);

/**
 * @deprecated Provided for backwards compatibility for Capacitor v2 plugins.
 * Capacitor v3 plugins should import the plugin directly.
 */
const Plugins: PluginRegistry = Capacitor.Plugins as any;

const registerPlugin: RegisterPlugin = Capacitor.registerPlugin as any;

export { Capacitor, Plugins, registerPlugin };
