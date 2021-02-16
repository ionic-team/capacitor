import type {
  CapacitorInstance,
  WindowCapacitor,
} from '../definitions-internal';

export const initLegacyHandlers = (
  win: WindowCapacitor,
  cap: CapacitorInstance,
): void => {
  if (cap.isNativePlatform()) {
    // define cordova if it's not there already
    win.cordova = win.cordova || {};

    const doc = win.document;
    const nav = win.navigator;

    if (nav) {
      nav.app = nav.app || {};
      nav.app.exitApp = () => {
        cap.nativeCallback('App', 'exitApp', {});
      };
    }

    if (doc) {
      const docAddEventListener = doc.addEventListener;
      doc.addEventListener = (...args: any[]) => {
        const eventName = args[0];
        const handler = args[1];
        if (eventName === 'deviceready' && handler) {
          Promise.resolve().then(handler);
        } else if (eventName === 'backbutton' && cap.Plugins.App) {
          // Add a dummy listener so Capacitor doesn't do the default
          // back button action
          cap.Plugins.App.addListener('backButton', () => {
            // ignore
          });
        }
        return docAddEventListener.apply(doc, args);
      };
    }
  }

  // deprecated in v3, remove from v4
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();
};
