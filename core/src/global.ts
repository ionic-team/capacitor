import { Capacitor as _Capacitor } from './definitions';

var Capacitor:_Capacitor = {
  Plugins: {}
};

declare var window: any;
Capacitor = window.Capacitor || Capacitor;

// Export window.Capacitor if not available already (ex: web)
if (!window.Capacitor) {
  window.Capacitor = Capacitor;
}

const Plugins = Capacitor.Plugins;

export { Capacitor, Plugins };
