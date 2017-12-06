import { PluginConfig, PluginCallback, WindowAvocado } from './definitions';

declare const window: WindowAvocado;


/**
 * Base class for all 3rd party plugins.
 */
export class Plugin {

  constructor() {
    (window.avocado as any)[this.config.name] = this;
  }

  nativeCallback(methodName: string, callback?: PluginCallback): void;
  nativeCallback(methodName: string, callback?: Function): void;
  nativeCallback(methodName: string, options?: any): void;
  nativeCallback(methodName: string, options?: any, callback?: PluginCallback): void;
  nativeCallback(methodName: string, options?: any, callback?: Function): void;
  nativeCallback(methodName: string, options?: any, callback?: any): void {
    if (typeof options === 'function') {
      // 2nd arg was a function
      // so it's the callback, not options
      callback = options;
      options = {};
    }

    window.avocado.toNative(this.config.id, methodName, options, {
      callback
    });
  }

  nativePromise(methodName: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      window.avocado.toNative(this.config.id, methodName, options, {
        resolve,
        reject
      });
    });
  }

  get config(): PluginConfig {
    return (this as any).constructor._config;
  }

  get isNative() {
    return window.avocado.isNative;
  }

  get platform() {
    return window.avocado.platform;
  }

}

/**
 * Plugin Decorator
 */
export function NativePlugin(config: PluginConfig) {
  return function(cls: any) {
    cls._config = Object.assign({}, config);
    return cls;
  };
}
