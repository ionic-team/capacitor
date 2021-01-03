import type { PluginListenerHandle, Plugin } from './definitions';
import { Capacitor } from './global';
import type { CapacitorException } from './util';
import { ExceptionCode } from './util';

/**
 * Base class web plugins should extend.
 */
export class WebPlugin implements Plugin {
  /**
   * @deprecated WebPluginConfig deprecated in v3 and will be removed in v4.
   */
  config?: WebPluginConfig;

  loaded = false;

  listeners: { [eventName: string]: ListenerCallback[] } = {};
  windowListeners: { [eventName: string]: WindowListenerHandle } = {};

  constructor(config?: WebPluginConfig) {
    if (config) {
      // TODO: add link to upgrade guide
      console.warn(
        `Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`,
      );
      this.config = config;
    }
  }

  protected unimplemented(msg = 'not implemented'): CapacitorException {
    return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
  }

  protected unavailable(msg = 'not available'): CapacitorException {
    return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
  }

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
    const listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listenerFunc);

    // If we haven't added a window listener for this event and it requires one,
    // go ahead and add it
    const windowListener = this.windowListeners[eventName];
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
    const listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }

    const index = listeners.indexOf(listenerFunc);
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
    const listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  hasListeners(eventName: string): boolean {
    return !!this.listeners[eventName].length;
  }

  registerWindowListener(
    windowEventName: string,
    pluginEventName: string,
  ): void {
    this.windowListeners[pluginEventName] = {
      registered: false,
      windowEventName,
      pluginEventName,
      handler: event => {
        this.notifyListeners(pluginEventName, event);
      },
    };
  }

  load(): void {
    this.loaded = true;
  }
}

export type ListenerCallback = (err: any, ...args: any[]) => void;

export interface WindowListenerHandle {
  registered: boolean;
  windowEventName: string;
  pluginEventName: string;
  handler: (event: any) => void;
}

/**
 * @deprecated Deprecated in v3, removing in v4.
 */
export interface WebPluginConfig {
  /**
   * @deprecated Deprecated in v3, removing in v4.
   */
  readonly name: string;
  /**
   * @deprecated Deprecated in v3, removing in v4.
   */
  platforms?: string[];
}
