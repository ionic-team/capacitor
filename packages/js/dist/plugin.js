import { Avocado } from './avocado';
/**
 * Base class for all 3rd party plugins.
 */
var Plugin = /** @class */ (function () {
    function Plugin() {
        this.avocado = Avocado.instance();
        this.avocado.registerPlugin(this);
    }
    Plugin.prototype.nativeCallback = function (method, options, callbackFunction, webFallback) {
        return this.native(method, options, 'callback', callbackFunction, webFallback);
    };
    Plugin.prototype.nativePromise = function (method, options, webFallback) {
        if (options === void 0) { options = {}; }
        return this.native(method, options, 'promise', null, webFallback);
    };
    /**
     * Call a native plugin method, or a web API fallback.
     */
    Plugin.prototype.native = function (method, options, callbackType, callbackFunction, webFallback) {
        var d = this.constructor.getPluginInfo();
        console.log("Avocado Plugin Call: " + d.id + " - " + method);
        // If avocado is running in a browser environment, call our
        // web fallback
        if (this.avocado.isBrowser()) {
            if (webFallback) {
                return webFallback(options);
            }
            else {
                throw new Error('Tried calling a native plugin method in the browser but no web fallback is available.');
            }
        }
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
    };
    return Plugin;
}());
export { Plugin };
/**
 * Decorator for AvocadoPlugin's
 */
export function AvocadoPlugin(config) {
    return function (cls) {
        cls['_avocadoPlugin'] = Object.assign({}, config);
        cls['getPluginInfo'] = function () {
            return cls['_avocadoPlugin'];
        };
        return cls;
    };
}
