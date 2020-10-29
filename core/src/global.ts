import type {
  Capacitor as CapacitorType,
  PluginRegistry,
  RegisterPlugin,
} from './definitions';
import { createCapacitor } from './runtime';

// Create our default Capacitor instance, which will be
// overridden on native platforms
const Capacitor = ((gbl: any): CapacitorType => {
  // Create a new CapacitorWeb instance if one doesn't already exist on globalThis
  // Ensure the global is assigned the same Capacitor instance,
  // then export Capacitor so it can be imported in other modules
  return (gbl.Capacitor = gbl.Capacitor || createCapacitor(gbl));
})(
  // figure out the current globalThis, such as "window", "self" or "global"
  // ensure errors are not thrown in an node SSR environment or web worker
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : {},
);

/**
 * @deprecated Please import the plugin in directly instead.
 */
const Plugins: PluginRegistry = Capacitor.Plugins as any;

const registerPlugin: RegisterPlugin = Capacitor.registerPlugin as any;

export { Capacitor, Plugins, registerPlugin };
