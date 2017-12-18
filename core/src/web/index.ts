export class WebPluginRegistry {
  plugins: { [name: string]: WebPlugin } = {};

  constructor() {
  }

  addPlugin(plugin: WebPlugin) {
    this.plugins[plugin.name] = plugin;
  }

  getPlugin(name: string) {
    return this.plugins[name];
  }

  getPlugins() {
    let p = [];
    for(let name in this.plugins) {
      p.push(this.plugins[name]);
    }
    return p;
  }
}

let WebPlugins = new WebPluginRegistry();
export { WebPlugins };

export class WebPlugin {
  _instance: any;

  constructor(public name: string, public pluginClass: any) {
    WebPlugins.addPlugin(this);
    this._instance = new this.pluginClass();
  }

  load() {
    this._instance.load && this._instance.load();
  }

  getInstance() {
    return this._instance;
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
  for(let plugin of plugins) {
    if(knownPlugins.hasOwnProperty(plugin.name)) { continue; }
    knownPlugins[plugin.name] = plugin.getInstance();
  }
}