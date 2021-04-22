
/*! Capacitor: https://capacitorjs.com/ - MIT License */
/*! Generated file. Do not edit */

(function () {
    'use strict';

    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    dummy = true;
    dummy = void 0;
    // For removing exports for iOS/Android
    var dummy = {};
    var initBridge = function (w) {
        var getPlatformId = function (win) {
            var _a, _b;
            if (win.androidBridge) {
                return 'android';
            }
            else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
                return 'ios';
            }
            else {
                return 'web';
            }
        };
        var convertFileSrcServerUrl = function (webviewServerUrl, filePath) {
            if (typeof filePath === 'string') {
                if (filePath.startsWith('/')) {
                    return webviewServerUrl + '/_capacitor_file_' + filePath;
                }
                else if (filePath.startsWith('file://')) {
                    return (webviewServerUrl + filePath.replace('file://', '/_capacitor_file_'));
                }
                else if (filePath.startsWith('content://')) {
                    return (webviewServerUrl +
                        filePath.replace('content:/', '/_capacitor_content_'));
                }
            }
            return filePath;
        };
        var initEvents = function (win, cap) {
            var doc = win.document;
            var cordova = win.cordova;
            cap.addListener = function (pluginName, eventName, callback) {
                var callbackId = cap.nativeCallback(pluginName, 'addListener', {
                    eventName: eventName
                }, callback);
                return {
                    remove: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.debug('Removing listener', pluginName, eventName);
                            cap.removeListener(pluginName, callbackId, eventName, callback);
                            return [2 /*return*/];
                        });
                    }); }
                };
            };
            cap.removeListener = function (pluginName, callbackId, eventName, callback) {
                cap.nativeCallback(pluginName, 'removeListener', {
                    callbackId: callbackId,
                    eventName: eventName
                }, callback);
            };
            cap.createEvent = function (eventName, eventData) {
                if (doc) {
                    var ev = doc.createEvent('Events');
                    ev.initEvent(eventName, false, false);
                    if (eventData && typeof eventData === 'object') {
                        for (var i in eventData) {
                            // eslint-disable-next-line no-prototype-builtins
                            if (eventData.hasOwnProperty(i)) {
                                ev[i] = eventData[i];
                            }
                        }
                    }
                    return ev;
                }
                return null;
            };
            cap.triggerEvent = function (eventName, target, eventData) {
                eventData = eventData || {};
                var ev = cap.createEvent(eventName, eventData);
                if (ev) {
                    if (target === 'document') {
                        if (cordova === null || cordova === void 0 ? void 0 : cordova.fireDocumentEvent) {
                            cordova.fireDocumentEvent(eventName, eventData);
                            return true;
                        }
                        else if (doc === null || doc === void 0 ? void 0 : doc.dispatchEvent) {
                            return doc.dispatchEvent(ev);
                        }
                    }
                    else if (target === 'window' && win.dispatchEvent) {
                        return win.dispatchEvent(ev);
                    }
                    else if (doc === null || doc === void 0 ? void 0 : doc.querySelector) {
                        var targetEl = doc.querySelector(target);
                        if (targetEl) {
                            return targetEl.dispatchEvent(ev);
                        }
                    }
                }
                return false;
            };
            win.Capacitor = cap;
        };
        var initLegacyHandlers = function (win, cap) {
            // define cordova if it's not there already
            win.cordova = win.cordova || {};
            var doc = win.document;
            var nav = win.navigator;
            if (nav) {
                nav.app = nav.app || {};
                nav.app.exitApp = function () {
                    if (!cap.Plugins || !cap.Plugins.App) {
                        win.console.warn('App plugin not installed');
                    }
                    else {
                        cap.nativeCallback('App', 'exitApp', {});
                    }
                };
            }
            if (doc) {
                var docAddEventListener_1 = doc.addEventListener;
                doc.addEventListener = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var eventName = args[0];
                    var handler = args[1];
                    if (eventName === 'deviceready' && handler) {
                        Promise.resolve().then(handler);
                    }
                    else if (eventName === 'backbutton' && cap.Plugins.App) {
                        // Add a dummy listener so Capacitor doesn't do the default
                        // back button action
                        if (!cap.Plugins || !cap.Plugins.App) {
                            win.console.warn('App plugin not installed');
                        }
                        else {
                            cap.Plugins.App.addListener('backButton', function () {
                                // ignore
                            });
                        }
                    }
                    return docAddEventListener_1.apply(doc, args);
                };
            }
            // deprecated in v3, remove from v4
            cap.platform = cap.getPlatform();
            cap.isNative = cap.isNativePlatform();
            win.Capacitor = cap;
        };
        var initVendor = function (win, cap) {
            var Ionic = (win.Ionic = win.Ionic || {});
            var IonicWebView = (Ionic.WebView = Ionic.WebView || {});
            var Plugins = cap.Plugins;
            IonicWebView.getServerBasePath = function (callback) {
                var _a;
                (_a = Plugins === null || Plugins === void 0 ? void 0 : Plugins.WebView) === null || _a === void 0 ? void 0 : _a.getServerBasePath().then(function (result) {
                    callback(result.path);
                });
            };
            IonicWebView.setServerBasePath = function (path) {
                var _a;
                (_a = Plugins === null || Plugins === void 0 ? void 0 : Plugins.WebView) === null || _a === void 0 ? void 0 : _a.setServerBasePath({ path: path });
            };
            IonicWebView.persistServerBasePath = function () {
                var _a;
                (_a = Plugins === null || Plugins === void 0 ? void 0 : Plugins.WebView) === null || _a === void 0 ? void 0 : _a.persistServerBasePath();
            };
            IonicWebView.convertFileSrc = function (url) { return cap.convertFileSrc(url); };
            win.Capacitor = cap;
            win.Ionic.WebView = IonicWebView;
        };
        var initLogger = function (win, cap) {
            var BRIDGED_CONSOLE_METHODS = [
                'debug',
                'error',
                'info',
                'log',
                'trace',
                'warn',
            ];
            var createLogFromNative = function (c) { return function (result) {
                if (isFullConsole(c)) {
                    var success = result.success === true;
                    var tagStyles = success
                        ? 'font-style: italic; font-weight: lighter; color: gray'
                        : 'font-style: italic; font-weight: lighter; color: red';
                    c.groupCollapsed('%cresult %c' +
                        result.pluginId +
                        '.' +
                        result.methodName +
                        ' (#' +
                        result.callbackId +
                        ')', tagStyles, 'font-style: italic; font-weight: bold; color: #444');
                    if (result.success === false) {
                        c.error(result.error);
                    }
                    else {
                        c.dir(result.data);
                    }
                    c.groupEnd();
                }
                else {
                    if (result.success === false) {
                        c.error('LOG FROM NATIVE', result.error);
                    }
                    else {
                        c.log('LOG FROM NATIVE', result.data);
                    }
                }
            }; };
            var createLogToNative = function (c) { return function (call) {
                if (isFullConsole(c)) {
                    c.groupCollapsed('%cnative %c' +
                        call.pluginId +
                        '.' +
                        call.methodName +
                        ' (#' +
                        call.callbackId +
                        ')', 'font-weight: lighter; color: gray', 'font-weight: bold; color: #000');
                    c.dir(call);
                    c.groupEnd();
                }
                else {
                    c.log('LOG TO NATIVE: ', call);
                }
            }; };
            var isFullConsole = function (c) {
                if (!c) {
                    return false;
                }
                return (typeof c.groupCollapsed === 'function' ||
                    typeof c.groupEnd === 'function' ||
                    typeof c.dir === 'function');
            };
            var serializeConsoleMessage = function (msg) {
                if (typeof msg === 'object') {
                    try {
                        msg = JSON.stringify(msg);
                    }
                    catch (e) {
                        // ignore
                    }
                }
                return String(msg);
            };
            // patch window.console on iOS and store original console fns
            var isIos = getPlatformId(win) === 'ios';
            var originalConsole = __assign({}, win.console);
            if (win.console && isIos) {
                var _loop_1 = function (logfn) {
                    win.console[logfn] = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var msgs = __spreadArrays(args);
                        originalConsole[logfn].apply(originalConsole, msgs);
                        try {
                            cap.toNative('Console', 'log', {
                                level: logfn,
                                message: msgs.map(serializeConsoleMessage).join(' ')
                            });
                        }
                        catch (e) {
                            // error converting/posting console messages
                            originalConsole.error(e);
                        }
                    };
                };
                for (var _i = 0, BRIDGED_CONSOLE_METHODS_1 = BRIDGED_CONSOLE_METHODS; _i < BRIDGED_CONSOLE_METHODS_1.length; _i++) {
                    var logfn = BRIDGED_CONSOLE_METHODS_1[_i];
                    _loop_1(logfn);
                }
            }
            cap.logJs = function (msg, level) {
                switch (level) {
                    case 'error':
                        win.console.error(msg);
                        break;
                    case 'warn':
                        win.console.warn(msg);
                        break;
                    case 'info':
                        win.console.info(msg);
                        break;
                    default:
                        win.console.log(msg);
                }
            };
            cap.logToNative = createLogToNative(win.console);
            cap.logFromNative = createLogFromNative(win.console);
            cap.handleError = function (err) { return win.console.error(err); };
            win.Capacitor = cap;
        };
        function initNativeBridge(win) {
            var cap = win.Capacitor || {};
            // keep a collection of callbacks for native response data
            var callbacks = new Map();
            var webviewServerUrl = typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';
            cap.getServerUrl = function () { return webviewServerUrl; };
            cap.convertFileSrc = function (filePath) {
                return convertFileSrcServerUrl(webviewServerUrl, filePath);
            };
            // Counter of callback ids, randomized to avoid
            // any issues during reloads if a call comes back with
            // an existing callback id from an old session
            var callbackIdCount = Math.floor(Math.random() * 134217728);
            var postToNative = null;
            var isNativePlatform = function () { return true; };
            var getPlatform = function () { return getPlatformId(win); };
            cap.getPlatform = getPlatform;
            cap.isNativePlatform = isNativePlatform;
            // create the postToNative() fn if needed
            if (getPlatformId(win) === 'android') {
                // android platform
                postToNative = function (data) {
                    var _a;
                    try {
                        win.androidBridge.postMessage(JSON.stringify(data));
                    }
                    catch (e) {
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.error(e);
                    }
                };
            }
            else if (getPlatformId(win) === 'ios') {
                // ios platform
                postToNative = function (data) {
                    var _a;
                    try {
                        data.type = data.type ? data.type : 'message';
                        win.webkit.messageHandlers.bridge.postMessage(data);
                    }
                    catch (e) {
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.error(e);
                    }
                };
            }
            cap.handleWindowError = function (msg, url, lineNo, columnNo, err) {
                var str = msg.toLowerCase();
                if (str.indexOf('script error') > -1) ;
                else {
                    var errObj = {
                        type: 'js.error',
                        error: {
                            message: msg,
                            url: url,
                            line: lineNo,
                            col: columnNo,
                            errorObject: JSON.stringify(err)
                        }
                    };
                    if (err !== null) {
                        cap.handleError(err);
                    }
                    postToNative(errObj);
                }
                return false;
            };
            if (cap.DEBUG) {
                window.onerror = cap.handleWindowError;
            }
            initLogger(win, cap);
            /**
             * Send a plugin method call to the native layer
             */
            cap.toNative = function (pluginName, methodName, options, storedCallback) {
                var _a, _b;
                try {
                    if (typeof postToNative === 'function') {
                        var callbackId = '-1';
                        if (storedCallback &&
                            (typeof storedCallback.callback === 'function' ||
                                typeof storedCallback.resolve === 'function')) {
                            // store the call for later lookup
                            callbackId = String(++callbackIdCount);
                            callbacks.set(callbackId, storedCallback);
                        }
                        var callData = {
                            callbackId: callbackId,
                            pluginId: pluginName,
                            methodName: methodName,
                            options: options || {}
                        };
                        if (cap.DEBUG && pluginName !== 'Console') {
                            cap.logToNative(callData);
                        }
                        // post the call data to native
                        postToNative(callData);
                        return callbackId;
                    }
                    else {
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.warn("implementation unavailable for: " + pluginName);
                    }
                }
                catch (e) {
                    (_b = win === null || win === void 0 ? void 0 : win.console) === null || _b === void 0 ? void 0 : _b.error(e);
                }
                return null;
            };
            /**
             * Process a response from the native layer.
             */
            cap.fromNative = function (result) {
                var _a, _b;
                if (cap.DEBUG && result.pluginId !== 'Console') {
                    cap.logFromNative(result);
                }
                // get the stored call, if it exists
                try {
                    var storedCall = callbacks.get(result.callbackId);
                    if (storedCall) {
                        // looks like we've got a stored call
                        if (result.error) {
                            // ensure stacktraces by copying error properties to an Error
                            result.error = Object.keys(result.error).reduce(function (err, key) {
                                // use any type to avoid importing util and compiling most of .ts files
                                err[key] = result.error[key];
                                return err;
                            }, new cap.Exception(''));
                        }
                        if (typeof storedCall.callback === 'function') {
                            // callback
                            if (result.success) {
                                storedCall.callback(result.data);
                            }
                            else {
                                storedCall.callback(null, result.error);
                            }
                        }
                        else if (typeof storedCall.resolve === 'function') {
                            // promise
                            if (result.success) {
                                storedCall.resolve(result.data);
                            }
                            else {
                                storedCall.reject(result.error);
                            }
                            // no need to keep this stored callback
                            // around for a one time resolve promise
                            callbacks["delete"](result.callbackId);
                        }
                    }
                    else if (!result.success && result.error) {
                        // no stored callback, but if there was an error let's log it
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.warn(result.error);
                    }
                    if (result.save === false) {
                        callbacks["delete"](result.callbackId);
                    }
                }
                catch (e) {
                    (_b = win === null || win === void 0 ? void 0 : win.console) === null || _b === void 0 ? void 0 : _b.error(e);
                }
                // always delete to prevent memory leaks
                // overkill but we're not sure what apps will do with this data
                delete result.data;
                delete result.error;
            };
            cap.nativeCallback = function (pluginName, methodName, options, callback) {
                if (typeof options === 'function') {
                    console.warn("Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated.");
                    callback = options;
                    options = null;
                }
                return cap.toNative(pluginName, methodName, options, { callback: callback });
            };
            cap.nativePromise = function (pluginName, methodName, options) {
                return new Promise(function (resolve, reject) {
                    cap.toNative(pluginName, methodName, options, {
                        resolve: resolve,
                        reject: reject
                    });
                });
            };
            cap.withPlugin = function (_pluginId, _fn) { return dummy; };
            initEvents(win, cap);
            initLegacyHandlers(win, cap);
            initVendor(win, cap);
            win.Capacitor = cap;
        }
        initNativeBridge(w);
    };
    dummy = initBridge;
    initBridge(typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
                ? window
                : typeof global !== 'undefined'
                    ? global
                    : {});

}());
