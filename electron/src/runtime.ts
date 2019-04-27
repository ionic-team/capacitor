export class CapacitorElectron {
  Plugins = {};
  platform = 'electron';
  isNative = false;

  constructor() {
    // Build a proxy for the Plugins object that returns the "Noop Plugin"
    // if a plugin isn't available
    this.Plugins = new Proxy<any>(this.Plugins, {
      get: (target, prop) => {
        if (typeof target[prop] === 'undefined') {
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

  convertFileSrc(filePath: string) {
    return filePath;
  }

  handleError(e: Error) {
    console.error(e);
  }
}
