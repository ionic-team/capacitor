import type { Capacitor, GlobalInstance, InternalState } from '../definitions';
import { noop } from '../util';

export const initLegacy = (
  gbl: GlobalInstance,
  instance: Capacitor,
  state: InternalState,
) => {
  // define cordova if it's not there already
  gbl.cordova = gbl.cordova || {};

  const doc = gbl.document;
  const nav = gbl.navigator;

  if (nav) {
    nav.app = nav.app || {};
    nav.app.exitApp = () => {
      instance.nativeCallback('App', 'exitApp', {});
    };
  }

  if (doc) {
    const docAddEventListener = doc.addEventListener;
    doc.addEventListener = function () {
      const eventName = arguments[0];
      const handler = arguments[1];
      if (eventName === 'deviceready' && handler) {
        Promise.resolve(handler);
      } else if (eventName === 'backbutton' && instance.Plugins.App) {
        // Add a dummy listener so Capacitor doesn't do the default
        // back button action
        instance.Plugins.App.addListener('backButton', noop);
      }
      return docAddEventListener.apply(doc, arguments);
    };
  }

  // deprecated in v3, remove from v4
  instance.platform = state.platform;
  instance.isNative = state.isNative;
};
