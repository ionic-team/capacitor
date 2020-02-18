import { Capacitor as _Capacitor } from './definitions';
import { CapacitorWeb } from './web-runtime';


// Create our default Capacitor instance, which will be
// overridden on native platforms
const Capacitor = ((globalThis: any): _Capacitor => {
  // Create a new CapacitorWeb instance if one doesn't already exist on globalThis
  // Ensure the global is assigned the same Capacitor instance,
  // then export Capacitor so it can be imported in other modules
  return globalThis.Capacitor = (globalThis.Capacitor || new CapacitorWeb());
})(
  // figure out the current globalThis, such as "window", "self" or "global"
  // ensure errors are not thrown in an node SSR environment or web worker
  typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
);


const Plugins = Capacitor.Plugins;

export { Capacitor, Plugins };
