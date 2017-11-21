var Platform = /** @class */ (function () {
    function Platform() {
    }
    return Platform;
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
        return this.native(method, options, 'callback', callbackFunction);
    };
    Plugin.prototype.nativePromise = function (method, options, webFallback) {
        return this.native(method, options, 'promise', null);
    };
    /**
     * Call a native plugin method, or a web API fallback.
     *
     * NO CONSOLE LOGS IN THIS METHOD! Can throw our
     * custom console handler into an infinite loop
     */
    Plugin.prototype.native = function (method, options, callbackType, callbackFunction) {
        var d = this.constructor.getPluginInfo();
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

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConsolePlugin = /** @class */ (function (_super) {
    __extends(ConsolePlugin, _super);
    function ConsolePlugin() {
        var _this = _super.call(this) || this;
        _this.queue = [];
        _this.originalLog = window.console.log;
        window.console.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            //const str = args.map(a => a.toString()).join(' ');
            _this.queue.push(['log'].concat(args));
            _this.originalLog.apply(console, args);
        };
        var syncQueue = function () {
            var queue = _this.queue.slice();
            while (queue.length) {
                var logMessage = queue.shift();
                var level = logMessage[0];
                var message = logMessage.slice(1);
                _this.nativeCallback('log', { level: level, message: message });
            }
            setTimeout(syncQueue, 100);
        };
        setTimeout(syncQueue);
        return _this;
    }
    ConsolePlugin.prototype.windowLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.originalLog.apply(this.originalLog, args);
    };
    ConsolePlugin = __decorate([
        AvocadoPlugin({
            name: 'Console',
            id: 'com.avocadojs.plugin.console'
        })
    ], ConsolePlugin);
    return ConsolePlugin;
}(Plugin));

var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * Main class for interacting with the Avocado runtime.
 */
var Avocado = /** @class */ (function () {
    function Avocado() {
        // Load console plugin first to avoid race conditions
        var _this = this;
        // Storage of calls for associating w/ native callback later
        this.calls = {};
        this.callbackIdCount = 0;
        this.platform = new Platform();
        setTimeout(function () { _this.loadCorePlugins(); });
    }
    Avocado.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift('Avocado: ');
        this.console && this.console.windowLog(args);
    };
    Avocado.prototype.loadCorePlugins = function () {
        this.console = new ConsolePlugin();
    };
    Avocado.prototype.registerPlugin = function (plugin) {
        var info = plugin.constructor.getPluginInfo();
        this.log('Registering plugin', info);
    };
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    Avocado.prototype.toNative = function (call, caller) {
        var ret;
        var callbackId = call.pluginId + ++this.callbackIdCount;
        call.callbackId = callbackId;
        switch (call.callbackType) {
            case undefined:
                ret = this._toNativePromise(call, caller);
            case 'callback':
                if (typeof caller.callbackFunction !== 'function') {
                    caller.callbackFunction = function () { };
                }
                ret = this._toNativeCallback(call, caller);
                break;
            case 'promise':
                ret = this._toNativePromise(call, caller);
            case 'observable':
                break;
        }
        //this.log('To native', call);
        // Send this call to the native layer
        window.webkit.messageHandlers.avocado.postMessage(__assign({ type: 'message' }, call));
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

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Directory;
(function (Directory) {
    Directory["Application"] = "APPLICATION";
    Directory["Documents"] = "DOCUMENTS";
    Directory["DocumentsSynced"] = "DOCUMENTS_SYNCED";
    Directory["Data"] = "DATA";
    Directory["DataSynced"] = "DATA_SYNCED";
    Directory["Cache"] = "CACHE";
})(Directory || (Directory = {}));

var FSPlugin = /** @class */ (function (_super) {
    __extends$1(FSPlugin, _super);
    function FSPlugin() {
        return _super.call(this) || this;
    }
    FSPlugin.prototype.writeFile = function (file, data, options) {
        return this.nativePromise('writeFile', {
            directory: options && options.directory || Directory.Documents,
            file: file,
            data: data
        });
    };
    FSPlugin.prototype.readFile = function (file, options) {
        return this.nativePromise('readFile', {
            directory: options && options.directory || Directory.Documents,
            file: file
        });
    };
    FSPlugin = __decorate$1([
        AvocadoPlugin({
            name: 'FS',
            id: 'com.avocadojs.plugin.fs'
        })
    ], FSPlugin);
    return FSPlugin;
}(Plugin));

export { Avocado, Platform, Plugin, AvocadoPlugin, ConsolePlugin, FSPlugin };
