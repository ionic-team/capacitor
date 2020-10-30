import type { CapacitorInstance, GlobalInstance } from './definitions';

export const initEvents = (
  gbl: GlobalInstance,
  instance: CapacitorInstance,
): void => {
  const doc: Document = gbl.document;
  const cordova = gbl.cordova;

  instance.addListener = (pluginName, eventName, callback) => {
    const callbackId = instance.nativeCallback(
      pluginName,
      'addListener',
      {
        eventName: eventName,
      },
      callback,
    );
    return {
      remove: () => {
        gbl?.console?.debug('Removing listener', pluginName, eventName);
        instance.removeListener(pluginName, callbackId, eventName, callback);
      },
    };
  };

  instance.removeListener = (pluginName, callbackId, eventName, callback) => {
    instance.nativeCallback(
      pluginName,
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
          // eslint-disable-next-line no-prototype-builtins
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
        if (cordova?.fireDocumentEvent) {
          cordova.fireDocumentEvent(eventName, eventData);
        } else if (doc?.dispatchEvent) {
          doc.dispatchEvent(ev);
        }
      } else if (target === 'window' && gbl.dispatchEvent) {
        (gbl as Window).dispatchEvent(ev);
      } else if (doc?.querySelector) {
        const targetEl: Element = doc.querySelector(target);
        if (targetEl) {
          targetEl.dispatchEvent(ev);
        }
      }
    }
  };
};
