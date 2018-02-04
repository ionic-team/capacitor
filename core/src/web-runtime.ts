export class CapacitorWeb {
  Plugins = {};
  platform = 'web';
  isNative = false;

  NOOP_PLUGIN: any = {};

  constructor() {
    this.NOOP_PLUGIN = new Proxy<any>(this.NOOP_PLUGIN, {
      get: (target, prop) => {
        if (typeof target[prop] === 'undefined') {
          return this.pluginMethodNoop.bind(this, target, prop);
        } else {
          return target[prop];
        }
      }
    });

    this.Plugins = new Proxy<any>(this.Plugins, {
      get: (target, prop) => {
        if (typeof target[prop] === 'undefined') {
          return this.NOOP_PLUGIN;
        } else {
          return target[prop];
        }
      }
    })
  }

  pluginMethodNoop(_target: any, _prop: PropertyKey) {
    return Promise.reject(`Plugin does not have web implementation.`);
  }

  getPlatform() {
    return this.platform;
  }

  hasPlugin(name: string) {
    return this.Plugins.hasOwnProperty(name);
  }
}
