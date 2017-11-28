import { Avocado } from './avocado';

import { PluginCallback, PluginCallOptions } from './definitions';

/**
 * Base class for all 3rd party plugins.
 */
export class Plugin {
  avocado: Avocado;

  constructor() {
    this.avocado = Avocado.instance();

    this.avocado.registerPlugin(this);
  }

  nativeCallback(method: string, options?: any, callbackFunction?: PluginCallback, callOptions?: PluginCallOptions) {
    if (typeof options === 'function') {
      callbackFunction = options;
      options = {};
    }
    return this.native(method, options, 'callback', callbackFunction);
  }

  nativePromise(method: string, options?: any, callOptions?: PluginCallOptions) {
    return this.native(method, options, 'promise', null, callOptions);
  }

  /**
   * Call a native plugin method, or a web API fallback.
   * 
   * NO CONSOLE LOGS IN THIS METHOD! Can throw our
   * custom console handler into an infinite loop
   */
  native(method: any, options: any, callbackType: string, callbackFunction?: PluginCallback, callOptions?: PluginCallOptions) {

    let d = (<any>this).constructor.getPluginInfo();

    // If avocado is running in a browser environment, call our
    // web fallback
    /*
    if(this.avocado.isBrowser()) {
      if(webFallback) {
        return webFallback(options);
      } else {
        throw new Error('Tried calling a native plugin method in the browser but no web fallback is available.');
      }
    }
    */

    // Avocado is running in a non-sandbox browser environment, call
    // the native code underneath
    return this.avocado.toNative({
      pluginId: d.id,
      methodName: method,
      options: options,
      callbackType: callbackType
    }, {
      callbackFunction: callbackFunction
    });
  }
}

/**
 * Decorator for AvocadoPlugin's
 */
export function NativePlugin(config: any) {
  return function(cls: any) {
    cls['_avocadoPlugin'] = Object.assign({
    }, config);

    cls['getPluginInfo'] = () => {
      return cls['_avocadoPlugin'];
    }
    return cls;
  };
}
