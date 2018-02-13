import { Capacitor as _Capacitor } from './definitions';

declare var window: any;

import { CapacitorWeb } from './web-runtime';

// Create our default Capacitor instance, which will be
// overridden on on native platforms
var Capacitor: _Capacitor = new CapacitorWeb();

Capacitor = window.Capacitor || Capacitor;

// Export window.Capacitor if not available already (ex: web)
if (!window.Capacitor) {
  window.Capacitor = Capacitor;
}

const Plugins = Capacitor.Plugins;

export { Capacitor, Plugins };
