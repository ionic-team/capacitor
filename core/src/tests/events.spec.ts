import { initBridge } from '../../native-bridge';
import { createCapacitor } from '../runtime';

import type {
  CapacitorInstance,
  WindowCapacitor,
} from '../definitions-internal';

describe('plugin', () => {
  let win: WindowCapacitor;
  let cap: CapacitorInstance;

  beforeEach(() => {
    win = {
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
    initBridge(win);
  });

  it('createEvent from document api', () => {
    cap = createCapacitor(win);
    const ev = cap.createEvent('eventName', { mph: 88 });
    expect(typeof ev.initEvent).toBe('function');
    expect((ev as any).mph).toBe(88);
  });

  it('createEvent, null when no document', () => {
    win = {};
    initBridge(win);
    cap = createCapacitor(win);
    const ev = cap.createEvent('eventName', { mph: 88 });
    expect(ev).toBe(null);
  });

  it('triggerEvent, window true', () => {
    let windowTrigger = false;
    win.dispatchEvent = () => {
      windowTrigger = true;
      return true;
    };
    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'window');
    expect(ev).toBe(true);
    expect(windowTrigger).toBe(true);
  });

  it('triggerEvent, window false', () => {
    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'window');
    expect(ev).toBe(false);
  });

  it('triggerEvent, document, cordova fireDocumentEvent', () => {
    let cordovaTrigger = false;
    win.cordova = {
      fireDocumentEvent() {
        cordovaTrigger = true;
      },
    };
    initBridge(win);

    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'document');
    expect(ev).toBe(true);
    expect(ev).toBe(cordovaTrigger);
  });

  it('triggerEvent, document true', () => {
    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'document');
    expect(ev).toBe(true);
  });

  it('triggerEvent, document false', () => {
    delete win.document;
    initBridge(win);

    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'document');
    expect(ev).toBe(false);
  });

  it('triggerEvent, querySelector true', () => {
    let querySelectorTriggered = false;
    win.document.querySelector = () => {
      return {
        dispatchEvent() {
          querySelectorTriggered = true;
          return true;
        },
      };
    };
    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'some-id');
    expect(ev).toBe(true);
    expect(querySelectorTriggered).toBe(true);
  });

  it('triggerEvent, querySelector false', () => {
    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'some-id');
    expect(ev).toBe(false);
  });

  it('triggerEvent, document querySelector false', () => {
    delete win.document;
    cap = createCapacitor(win);
    const ev = cap.triggerEvent('eventName', 'some-id');
    expect(ev).toBe(false);
  });
});
