import { PluginListenerHandle } from '../definitions';

export class WebPluginRegistry {
  plugins: { [name: string]: WebPlugin } = {};
  loadedPlugins: { [name: string]: WebPlugin } = {};

  constructor() {
  }

  addPlugin(plugin: WebPlugin) {
    this.plugins[plugin.config.name] = plugin;
  }

  getPlugin(name: string) {
    return this.plugins[name];
  }

  loadPlugin(name: string) {
    let plugin = this.getPlugin(name);
    if (!plugin) {
      console.error(`Unable to load web plugin ${name}, no such plugin found.`);
      return;
    }

    plugin.load();
  }

  getPlugins() {
    let p = [];
    for (let name in this.plugins) {
      p.push(this.plugins[name]);
    }
    return p;
  }
}

let WebPlugins = new WebPluginRegistry();
export { WebPlugins };

export type ListenerCallback = (data: any) => void;

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
  name: string;
  /**
   * The platforms this web plugin should run on. Leave null
   * for this plugin to always run.
   */
  platforms?: string[];
}

export class WebPlugin {
  loaded: boolean = false;

  listeners: { [eventName: string]: ListenerCallback[] } = {};
  windowListeners: { [eventName: string]: WindowListenerHandle } = {};

  constructor(public config: WebPluginConfig, pluginRegistry?: WebPluginRegistry) {
    if (!pluginRegistry) {
      WebPlugins.addPlugin(this);
    } else {
      pluginRegistry.addPlugin(this);
    }
  }

  private addWindowListener(handle: WindowListenerHandle): void {
    window.addEventListener(handle.windowEventName, handle.handler);
    handle.registered = true;
  }

  private removeWindowListener(handle: WindowListenerHandle): void {
    if (!handle) { return; }

    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }

  addListener(eventName: string, listenerFunc: ListenerCallback): PluginListenerHandle {
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
      }
    };
  }

  removeListener(eventName: string, listenerFunc: ListenerCallback): void {
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

  notifyListeners(eventName: string, data: any): void {
    let listeners = this.listeners[eventName];
    listeners.forEach(listener => listener(data));
  }

  hasListeners(eventName: string): boolean {
    return !!this.listeners[eventName].length;
  }

  registerWindowListener(windowEventName: string, pluginEventName: string) {
    this.windowListeners[pluginEventName] = {
      registered: false,
      windowEventName,
      pluginEventName,
      handler: (event) => {
        this.notifyListeners(pluginEventName, event);
      }
    };
  }

  load(): void {
    this.loaded = true;
  }
}

/**
 * For all our known web plugins, merge them into the global plugins
 * registry if they aren't already existing. If they don't exist, that
 * means there's no existing native implementation for it.
 * @param knownPlugins the Avocado.Plugins global registry.
 */
export const mergeWebPlugins = (knownPlugins: any) => {
  let plugins = WebPlugins.getPlugins();
  for (let plugin of plugins) {
    if (knownPlugins.hasOwnProperty(plugin.config.name)) { continue; }
    knownPlugins[plugin.config.name] = plugin;
  }
};
