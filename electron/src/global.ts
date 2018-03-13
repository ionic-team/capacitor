import {Capacitor as _Capacitor} from '@capacitor/core/dist/esm/definitions';

declare var window: any;

import { CapacitorElectron } from './runtime';

// Create our default Capacitor instance, which will be
// overridden on native platforms
// @ts-ignore
var Capacitor: _Capacitor = new CapacitorElectron();

Capacitor = window.Capacitor || Capacitor;

// Export window.Capacitor if not available already (ex: web)
if (!window.Capacitor) {
  window.Capacitor = Capacitor;
}

const Plugins = Capacitor.Plugins;

export { Capacitor, Plugins };
