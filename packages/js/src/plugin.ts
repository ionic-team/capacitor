import { Avocado } from './avocado';
/**
 * Base class for all 3rd party plugins.
 */
export class Plugin {
  avocado: Avocado;

  constructor() {
    this.avocado = Avocado.instance();

    this.avocado.registerPlugin(this);
  }

  nativeCallback(method: string, data: any, callbackFunction: Function, webFallback?: Function) {
    return this.native(method, data, 'callback', callbackFunction, webFallback)
  }

  nativePromise(method: string, data: any = {}, webFallback?: Function) {
    return this.native(method, data, 'promise', null, webFallback)
  }

  /**
   * Call a native plugin method, or a web API fallback.
   */
  native(method: any, data: any, callbackType: string, callbackFunction: Function, webFallback: Function) {

    let d = (<any>this).constructor.getPluginInfo();

    console.log(`Avocado Plugin Call: ${d.id} - ${method}`);

    // If avocado is running in a browser environment, call our
    // web fallback
    if(this.avocado.isBrowser()) {
      if(webFallback) {
        return webFallback(data);
      } else {
        throw new Error('Tried calling a native plugin method in the browser but no web fallback is available.');
      }
    }

    // Avocado is running in a non-sandbox browser environment, call
    // the native code underneath
    return this.avocado.toNative({
      pluginId: d.id,
      methodName: method,
      data: data,
      callbackType: callbackType
    }, {
      callbackFunction: callbackFunction
    });
  }
}

/**
 * Decorator for AvocadoPlugin's
 */
export function AvocadoPlugin(config: any) {
  return function(cls: any) {
    cls['_avocadoPlugin'] = Object.assign({
    }, config);

    cls['getPluginInfo'] = () => {
      return cls['_avocadoPlugin'];
    }
    return cls;
  };
}
