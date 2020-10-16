import type { Capacitor, PluginRegistry, ExceptionCode } from './definitions';

class CapacitorException extends Error {
  constructor(readonly message: string, readonly code: ExceptionCode) {
    super(message);
  }
}

export class CapacitorWeb implements Capacitor {
  Exception = CapacitorException;
  Plugins: PluginRegistry;
  platform = 'web';
  isNative = false;

  constructor() {
    // Need to assign here to avoid having to define every plugin but still
    // get the typed benefits of the provided plugins in PluginRegistry
    this.Plugins = {} as any;

    // Gracefully degrade in non-Proxy supporting engines, e.g. IE11. This
    // effectively means that trying to access an unavailable plugin will
    // locally throw, but this is still better than throwing a syntax error.
    if (typeof Proxy !== 'undefined') {
      // Build a proxy for the Plugins object that returns the "Noop Plugin"
      // if a plugin isn't available
      this.Plugins = new Proxy<any>(this.Plugins, {
        get: (target, prop) => {
          if (typeof target[prop] === 'undefined') {
            const thisRef = this;
            return new Proxy<any>(
              {},
              {
                get: (_target, _prop) => {
                  if (typeof _target[_prop] === 'undefined') {
                    return thisRef.pluginMethodNoop.bind(
                      thisRef,
                      _target,
                      _prop,
                      prop,
                    );
                  } else {
                    return _target[_prop];
                  }
                },
              },
            );
          } else {
            return target[prop];
          }
        },
      });
    }
  }

  private pluginMethodNoop(
    _target: any,
    _prop: PropertyKey,
    pluginName: string,
  ) {
    return Promise.reject(`${pluginName} does not have web implementation.`);
  }

  getPlatform(): string {
    return this.platform;
  }

  isPluginAvailable(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.Plugins, name);
  }

  convertFileSrc(filePath: string): string {
    return filePath;
  }

  handleError(e: Error): void {
    console.error(e);
  }
}
