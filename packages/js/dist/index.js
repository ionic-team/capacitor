var Platform = /** @class */ (function () {
    function Platform() {
    }
    return Platform;
}());

/**
 * Main class for interacting with the Avocado runtime.
 */
var Avocado = /** @class */ (function () {
    function Avocado() {
        // Storage of calls for associating w/ native callback later
        this.calls = {};
        this.callbackIdCount = 0;
        this.log('initializing...');
        this.log('Detecting platform');
        this.platform = new Platform();
        this.loadPlugins();
    }
    Avocado.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift('Avocado: ');
        console.log.apply(console, args);
    };
    Avocado.prototype.loadPlugins = function () {
        this.log('Loading plugins');
    };
    Avocado.prototype.registerPlugin = function (plugin) {
        var info = plugin.constructor.getPluginInfo();
        this.log('Registering plugin', info);
    };
    /**
     * Send a plugin method call to the native layer.
     */
    Avocado.prototype.toNative = function (call, caller) {
        var ret;
        var callbackId = call.pluginId + ++this.callbackIdCount;
        call.callbackId = callbackId;
        switch (call.callbackType) {
            case undefined:
                ret = this._toNativePromise(call, caller);
            case 'callback':
                ret = this._toNativeCallback(call, caller);
                break;
            case 'promise':
                ret = this._toNativePromise(call, caller);
            case 'observable':
                break;
        }
        console.log('To native', call);
        // Send this call to the native layer
        window.webkit.messageHandlers.avocado.postMessage(call);
        return ret;
    };
    Avocado.prototype._toNativeCallback = function (call, caller) {
        this._saveCallback(call, caller.callbackFunction);
    };
    Avocado.prototype._toNativePromise = function (call, caller) {
        var promiseCall = {};
        var promise = new Promise(function (resolve, reject) {
            promiseCall['$resolve'] = resolve;
            promiseCall['$reject'] = reject;
        });
        promiseCall['$promise'] = promise;
        this._saveCallback(call, promiseCall);
        return promise;
    };
    Avocado.prototype._saveCallback = function (call, callbackHandler) {
        call.callbackId = call.callbackId;
        this.calls[call.callbackId] = {
            call: call,
            callbackHandler: callbackHandler
        };
    };
    /**
     * Process a response from the native layer.
     */
    Avocado.prototype.fromNative = function (result) {
        console.log('From Native', result);
        var storedCall = this.calls[result.callbackId];
        console.log('Stored call', storedCall);
        var call = storedCall.call, callbackHandler = storedCall.callbackHandler;
        this._fromNativeCallback(result, storedCall);
    };
    Avocado.prototype._fromNativeCallback = function (result, storedCall) {
        var call = storedCall.call, callbackHandler = storedCall.callbackHandler;
        switch (storedCall.call.callbackType) {
            case 'promise': {
                if (result.success === false) {
                    callbackHandler.$reject(result.error);
                }
                else {
                    callbackHandler.$resolve(result.data);
                }
                break;
            }
            case 'callback': {
                if (typeof callbackHandler == 'function') {
                    result.success ? callbackHandler(null, result.data) : callbackHandler(result.error, null);
                }
            }
        }
    };
    /**
     * @return whether or not we're running in a browser sandbox environment
     * with no acces to native functionality (progressive web, desktop browser, etc).
     */
    Avocado.prototype.isBrowser = function () {
        // TODO: Make this generic
        return !!!window.webkit;
    };
    /**
     * @return the instance of Avocado
     */
    Avocado.instance = function () {
        if (window.avocado) {
            return window.avocado;
        }
        return window.avocado = new Avocado();
    };
    return Avocado;
}());

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

export { Avocado, Platform, Plugin, AvocadoPlugin };
