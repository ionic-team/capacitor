export class CapacitorWeb {
  Plugins = {};
  platform = 'web';
  isNative = false;

  NOOP_PLUGIN: any = {};

  constructor() {
    // Construct a "Noop Plugin" that handles all method calls if a plugin
    // isn't available, returning a rejected promise
    /*
    this.NOOP_PLUGIN = new Proxy<any>(this.NOOP_PLUGIN, {
      get: (target, prop) => {
        console.log('NOOP:: target: ' + JSON.stringify(target) + '  ---  prop: ' + JSON.stringify(prop));
        if (typeof target[prop] === 'undefined') {
          return this.pluginMethodNoop.bind(this, target, prop);
        } else {
          return target[prop];
        }
      }
    });
    */

    // Build a proxy for the Plugins object that returns the "Noop Plugin"
    // if a plugin isn't available
    this.Plugins = new Proxy<any>(this.Plugins, {
      get: (target, prop) => {
        if (typeof target[prop] === 'undefined') {
          //return this.NOOP_PLUGIN;
          let thisRef = this;
          return new Proxy<any>({}, {
              get: (_target, _prop) => {
                  if (typeof _target[_prop] === 'undefined') {
                      return thisRef.pluginMethodNoop.bind(thisRef, _target, _prop,  prop);
                  } else {
                      return _target[_prop];
                  }
              }
          });
        } else {
          return target[prop];
        }
      }
    })
  }

  pluginMethodNoop(_target: any, _prop: PropertyKey, pluginName: string) {
    return Promise.reject(`${pluginName} does not have web implementation.`);
  }

  getPlatform() {
    return this.platform;
  }

  isPluginAvailable(name: string) {
    return this.Plugins.hasOwnProperty(name);
  }

  handleError(e: Error) {
    console.error(e);
  }
}
