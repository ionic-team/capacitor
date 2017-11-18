"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var avocado_1 = require("./avocado");
/**
 * Base class for all 3rd party plugins.
 */
var Plugin = (function () {
    function Plugin() {
        this.avocado = avocado_1.Avocado.instance();
        this.avocado.registerPlugin(this);
    }
    Plugin.prototype.nativeCallback = function (method, data, callbackFunction, webFallback) {
        return this.native(method, data, 'callback', callbackFunction, webFallback);
    };
    Plugin.prototype.nativePromise = function (method, data, webFallback) {
        return this.native(method, data, 'promise', null, webFallback);
    };
    /**
     * Call a native plugin method, or a web API fallback.
     */
    Plugin.prototype.native = function (method, data, callbackType, callbackFunction, webFallback) {
        var d = this.constructor.getPluginInfo();
        console.log("Avocado Plugin Call: " + d.id + " - " + method);
        // If avocado is running in a browser environment, call our
        // web fallback
        if (this.avocado.isBrowser()) {
            if (webFallback) {
                return webFallback(data);
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
            data: data,
            callbackType: callbackType
        }, {
            callbackFunction: callbackFunction
        });
    };
    return Plugin;
}());
exports.Plugin = Plugin;
/**
 * Decorator for AvocadoPlugin's
 */
function AvocadoPlugin(config) {
    return function (cls) {
        cls['_avocadoPlugin'] = Object.assign({}, config);
        cls['getPluginInfo'] = function () {
            return cls['_avocadoPlugin'];
        };
        return cls;
    };
}
exports.AvocadoPlugin = AvocadoPlugin;
