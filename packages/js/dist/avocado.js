"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var platform_1 = require("./platform");
/**
 * Main class for interacting with the Avocado runtime.
 */
var Avocado = (function () {
    function Avocado() {
        // Storage of calls for associating w/ native callback later
        this.calls = {};
        this.callbackIdCount = 0;
        this.log('initializing...');
        this.log('Detecting platform');
        this.platform = new platform_1.Platform();
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
        var call = storedCall.call, callbackHandler = storedCall.callbackHandler;
        this.log('Found callback', storedCall.callbackHandler);
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
                if (typeof callbackHandler == 'function' && result.success) {
                    callbackHandler(result.data);
                }
                else {
                    // TODO: Should pass us an error callback
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
exports.Avocado = Avocado;
