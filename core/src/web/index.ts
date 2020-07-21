import { PluginListenerHandle, PermissionsRequestResult } from '../definitions';
import { Capacitor } from '../global';

export type ListenerCallback = (err: any, ...args: any[]) => void;

export interface WindowListenerHandle {
  registered: boolean;
  windowEventName: string;
  pluginEventName: string;
  handler: (event: any) => void;
}

export interface WebPluginConfig {
  /**
   * The name of the plugin
   */
  readonly name: string;
}

export class WebPlugin {
  loaded: boolean = false;

  listeners: { [eventName: string]: ListenerCallback[] } = {};
  windowListeners: { [eventName: string]: WindowListenerHandle } = {};

  constructor(public config: WebPluginConfig) {}

  private addWindowListener(handle: WindowListenerHandle): void {
    window.addEventListener(handle.windowEventName, handle.handler);
    handle.registered = true;
  }

  private removeWindowListener(handle: WindowListenerHandle): void {
    if (!handle) {
      return;
    }

    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }

  addListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ): PluginListenerHandle {
    let listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listenerFunc);

    // If we haven't added a window listener for this event and it requires one,
    // go ahead and add it
    let windowListener = this.windowListeners[eventName];
    if (windowListener && !windowListener.registered) {
      this.addWindowListener(windowListener);
    }

    return {
      remove: () => {
        this.removeListener(eventName, listenerFunc);
      },
    };
  }

  private removeListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ): void {
    let listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }

    let index = listeners.indexOf(listenerFunc);
    this.listeners[eventName].splice(index, 1);

    // If there are no more listeners for this type of event,
    // remove the window listener
    if (!this.listeners[eventName].length) {
      this.removeWindowListener(this.windowListeners[eventName]);
    }
  }

  removeAllListeners(): void {
    this.listeners = {};
    for (const listener in this.windowListeners) {
      this.removeWindowListener(this.windowListeners[listener]);
    }
    this.windowListeners = {};
  }

  notifyListeners(eventName: string, data: any): void {
    let listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  hasListeners(eventName: string): boolean {
    return !!this.listeners[eventName].length;
  }

  registerWindowListener(windowEventName: string, pluginEventName: string) {
    this.windowListeners[pluginEventName] = {
      registered: false,
      windowEventName,
      pluginEventName,
      handler: event => {
        this.notifyListeners(pluginEventName, event);
      },
    };
  }

  requestPermissions(): Promise<PermissionsRequestResult> {
    if (Capacitor.isNative) {
      return Capacitor.nativePromise(
        this.config.name,
        'requestPermissions',
        {},
      );
    } else {
      return Promise.resolve({ results: [] });
    }
  }

  load(): void {
    this.loaded = true;
  }
}
