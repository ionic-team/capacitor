import type { CapacitorInstance, GlobalInstance } from '../definitions';
import { createCapacitor } from '../runtime';

describe('plugin', () => {
  let instance: CapacitorInstance;
  let gbl: GlobalInstance;

  beforeEach(() => {
    gbl = {
      document: {
        createEvent() {
          return {
            initEvent() {
              return true;
            },
          };
        },
        dispatchEvent() {
          return true;
        },
      },
    };
  });

  it('createEvent from document api', () => {
    instance = createCapacitor(gbl);
    const ev = instance.createEvent('eventName', { mph: 88 });
    expect(typeof ev.initEvent).toBe('function');
    expect((ev as any).mph).toBe(88);
  });

  it('createEvent, null when no document', () => {
    delete gbl.document;
    instance = createCapacitor(gbl);
    const ev = instance.createEvent('eventName', { mph: 88 });
    expect(ev).toBe(null);
  });

  it('triggerEvent, window true', () => {
    let windowTrigger = false;
    gbl.dispatchEvent = () => {
      windowTrigger = true;
      return true;
    };
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'window');
    expect(ev).toBe(true);
    expect(windowTrigger).toBe(true);
  });

  it('triggerEvent, window false', () => {
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'window');
    expect(ev).toBe(false);
  });

  it('triggerEvent, document, cordova fireDocumentEvent', () => {
    let cordovaTrigger = false;
    gbl.cordova = {
      fireDocumentEvent() {
        cordovaTrigger = true;
      },
    };
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'document');
    expect(ev).toBe(true);
    expect(ev).toBe(cordovaTrigger);
  });

  it('triggerEvent, document true', () => {
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'document');
    expect(ev).toBe(true);
  });

  it('triggerEvent, document false', () => {
    delete gbl.document;
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'document');
    expect(ev).toBe(false);
  });

  it('triggerEvent, querySelector true', () => {
    let querySelectorTriggered = false;
    gbl.document.querySelector = () => {
      return {
        dispatchEvent() {
          querySelectorTriggered = true;
          return true;
        },
      };
    };
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'some-id');
    expect(ev).toBe(true);
    expect(querySelectorTriggered).toBe(true);
  });

  it('triggerEvent, querySelector false', () => {
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'some-id');
    expect(ev).toBe(false);
  });

  it('triggerEvent, document querySelector false', () => {
    delete gbl.document;
    instance = createCapacitor(gbl);
    const ev = instance.triggerEvent('eventName', 'some-id');
    expect(ev).toBe(false);
  });
});
