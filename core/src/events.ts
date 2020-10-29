import type { CapacitorInstance, GlobalInstance } from './definitions';

export const initEvents = (
  gbl: GlobalInstance,
  instance: CapacitorInstance,
): void => {
  const doc: Document = gbl.document;
  const cordova = gbl.cordova;

  instance.addListener = (pluginId, eventName, callback) => {
    const callbackId = instance.nativeCallback(
      pluginId,
      'addListener',
      {
        eventName: eventName,
      },
      callback,
    );
    return {
      remove: () => {
        if (gbl.console && gbl.console.debug) {
          gbl.console.debug('Removing listener', pluginId, eventName);
        }
        instance.removeListener(pluginId, callbackId, eventName, callback);
      },
    };
  };

  instance.removeListener = (pluginId, callbackId, eventName, callback) => {
    instance.nativeCallback(
      pluginId,
      'removeListener',
      {
        callbackId: callbackId,
        eventName: eventName,
      },
      callback,
    );
  };

  instance.createEvent = (eventName, eventData) => {
    if (doc) {
      const ev = doc.createEvent('Events');
      ev.initEvent(eventName, false, false);
      if (eventData && typeof eventData === 'object') {
        for (const i in eventData) {
          if (eventData.hasOwnProperty(i)) {
            (ev as any)[i] = eventData[i];
          }
        }
      }
      return ev;
    }
    return null;
  };

  instance.triggerEvent = (eventName, target, eventData) => {
    eventData = eventData || {};
    const ev = instance.createEvent(eventName, eventData);

    if (ev) {
      if (target === 'document') {
        if (cordova && cordova.fireDocumentEvent) {
          cordova.fireDocumentEvent(eventName, eventData);
        } else if (doc && doc.dispatchEvent) {
          doc.dispatchEvent(ev);
        }
      } else if (target === 'window' && gbl.dispatchEvent) {
        (gbl as Window).dispatchEvent(ev);
      } else if (doc && doc.querySelector) {
        const targetEl: Element = doc.querySelector(target);
        if (targetEl) {
          targetEl.dispatchEvent(ev);
        }
      }
    }
  };
};
