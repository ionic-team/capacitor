import { CapacitorInstance, WindowCapacitor } from "./definitions-internal";

export const initEvents = (win: WindowCapacitor, cap: CapacitorInstance) => {
  const doc = win.document;
  const cordova = win.cordova;
  
  cap.addListener = (pluginName, eventName, callback) => {
    const callbackId = cap.nativeCallback(
      pluginName,
      'addListener',
      {
        eventName: eventName,
      },
      callback,
    );
    return {
      remove: async () => {
        if (win.console && win.console.debug) {
          win.console.debug('Removing listener', pluginName, eventName);
        }
        cap.removeListener(pluginName, callbackId, eventName, callback);
      },
    };
  };

  cap.removeListener = (pluginName, callbackId, eventName, callback) => {
    cap.nativeCallback(
      pluginName,
      'removeListener',
      {
        callbackId: callbackId,
        eventName: eventName,
      },
      callback,
    );
  };

  cap.createEvent = (eventName, eventData) => {
    if (doc) {
      const ev = doc.createEvent('Events');
      ev.initEvent(eventName, false, false);
      if (eventData && typeof eventData === 'object') {
        for (const i in eventData) {
          // eslint-disable-next-line no-prototype-builtins
          if (eventData.hasOwnProperty(i)) {
            ev[i] = eventData[i];
          }
        }
      }
      return ev;
    }
    return null;
  };

  cap.triggerEvent = (eventName, target, eventData) => {
    eventData = eventData || {};
    const ev = cap.createEvent(eventName, eventData);

    if (ev) {
      if (target === 'document') {
        if (cordova && cordova.fireDocumentEvent) {
          cordova.fireDocumentEvent(eventName, eventData);
          return true;
        } else if (doc && doc.dispatchEvent) {
          return doc.dispatchEvent(ev);
        }
      } else if (target === 'window' && win.dispatchEvent) {
        return win.dispatchEvent(ev);
      } else if (doc && doc.querySelector) {
        const targetEl = doc.querySelector(target);
        if (targetEl) {
          return targetEl.dispatchEvent(ev);
        }
      }
    }
    return false;
  };
};
