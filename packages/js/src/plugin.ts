import { Avocado } from './avocado';
import { PluginConfig, PluginCallback } from './definitions';

/**
 * Base class for all 3rd party plugins.
 */
export class Plugin {
  private avocado: Avocado;
  isNative: boolean;
  platform: string;

  constructor() {
    this.avocado = Avocado.instance();
    this.isNative = this.avocado.isNative;
    this.platform = this.avocado.platform;
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

    this.avocado.toNative(this.pluginId(), methodName, options, {
      callbackFunction: callback
    });
  }

  nativePromise(methodName: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.avocado.toNative(this.pluginId(), methodName, options, {
        callbackResolve: resolve,
        callbackReject: reject
      });
    });
  }

  pluginId() {
    const config: PluginConfig = (this as any).constructor.getPluginInfo();
    return config.id;
  }

}

/**
 * Plugin Decorator
 */
export function NativePlugin(config: PluginConfig) {
  return function(cls: any) {
    cls['_avocadoPlugin'] = Object.assign({}, config);
    cls['getPluginInfo'] = () => cls['_avocadoPlugin'];
    return cls;
  };
}
