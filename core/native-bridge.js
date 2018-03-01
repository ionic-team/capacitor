// Proxy Polyfill
(function(scope) {
    /*
     * Copyright 2016 Google Inc. All rights reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License"); you may not
     * use this file except in compliance with the License. You may obtain a copy of
     * the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
     * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
     * License for the specific language governing permissions and limitations under
     * the License.
    */
    if (scope['Proxy']) {
        return;
    } else {
        console.warn('Proxy is not defined, using polyfill...');
    }
    var lastRevokeFn = null;

    /**
     * @param {*} o
     * @return {boolean} whether this is probably a (non-null) Object
     */
    function isObject(o) {
        return o ? (typeof o === 'object' || typeof o === 'function') : false;
    }

    /**
     * @letructor
     * @param {!Object} target
     * @param {{apply, letruct, get, set}} handler
     */
    scope.Proxy = function(target, handler) {
        if (!isObject(target) || !isObject(handler)) {
            throw new TypeError('Cannot create proxy with a non-object as target or handler');
        }

        // letruct revoke function, and set lastRevokeFn so that Proxy.revocable can steal it.
        // The caller might get the wrong revoke function if a user replaces or wraps scope.Proxy
        // to call itself, but that seems unlikely especially when using the polyfill.
        var throwRevoked = function() {};
        lastRevokeFn = function() {
            throwRevoked = function(trap) {
                throw new TypeError('Cannot perform \''+trap+'\' on a proxy that has been revoked');
            };
        };

        // Fail on unsupported traps: Chrome doesn't do this, but ensure that users of the polyfill
        // are a bit more careful. Copy the internal parts of handler to prevent user changes.
        var unsafeHandler = handler;
        handler = {'get': null, 'set': null, 'apply': null, 'letruct': null};
        for (var k in unsafeHandler) {
            if (!(k in handler)) {
                throw new TypeError('Proxy polyfill does not support trap \''+k+'\'');
            }
            handler[k] = unsafeHandler[k];
        }
        if (typeof unsafeHandler === 'function') {
            // Allow handler to be a function (which has an 'apply' method). This matches what is
            // probably a bug in native versions. It treats the apply call as a trap to be configured.
            handler.apply = unsafeHandler.apply.bind(unsafeHandler);
        }

        // Define proxy as this, or a Function (if either it's callable, or apply is set).
        // TODO(samthor): Closure compiler doesn't know about 'letruct', attempts to rename it.
        var proxy = this;
        var isMethod = false;
        var isArray = false;
        if (typeof target === 'function') {
            proxy = function Proxy() {
                var usingNew = (this && this.letructor === proxy);
                var args = Array.prototype.slice.call(arguments);
                throwRevoked(usingNew ? 'letruct' : 'apply');

                if (usingNew && handler['letruct']) {
                    return handler['letruct'].call(this, target, args);
                } else if (!usingNew && handler.apply) {
                    return handler.apply(target, this, args);
                }

                // since the target was a function, fallback to calling it directly.
                if (usingNew) {
                    // inspired by answers to https://stackoverflow.com/q/1606797
                    args.unshift(target);  // pass class as first arg to letructor, although irrelevant
                    // nb. cast to convince Closure compiler that this is a letructor
                    var f = /** @type {!Function} */ (target.bind.apply(target, args));
                    return new f();
                }
                return target.apply(this, args);
            };
            isMethod = true;
        } else if (target instanceof Array) {
            proxy = [];
            isArray = true;
        }

        // Create default getters/setters. Create different code paths as handler.get/handler.set can't
        // change after creation.
        var getter = handler.get ? function(prop) {
            throwRevoked('get');
            return handler.get(this, prop, proxy);
        } : function(prop) {
            throwRevoked('get');
            return this[prop];
        };
        var setter = handler.set ? function(prop, value) {
            throwRevoked('set');
            var status = handler.set(this, prop, value, proxy);
            if (!status) {
                // TODO(samthor): If the calling code is in strict mode, throw TypeError.
                // It's (sometimes) possible to work this out, if this code isn't strict- try to load the
                // callee, and if it's available, that code is non-strict. However, this isn't exhaustive.
            }
        } : function(prop, value) {
            throwRevoked('set');
            this[prop] = value;
        };

        // Clone direct properties (i.e., not part of a prototype).
        var propertyNames = Object.getOwnPropertyNames(target);
        var propertyMap = {};
        propertyNames.forEach(function(prop) {
            if ((isMethod || isArray) && prop in proxy) {
                return;  // ignore properties already here, e.g. 'bind', 'prototype' etc
            }
            var real = Object.getOwnPropertyDescriptor(target, prop);
            var desc = {
                enumerable: !!real.enumerable,
                get: getter.bind(target, prop),
                set: setter.bind(target, prop),
            };
            Object.defineProperty(proxy, prop, desc);
            propertyMap[prop] = true;
        });

        // Set the prototype, or clone all prototype methods (always required if a getter is provided).
        // TODO(samthor): We don't allow prototype methods to be set. It's (even more) awkward.
        // An alternative here would be to _just_ clone methods to keep behavior consistent.
        var prototypeOk = true;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
        } else if (proxy.__proto__) {
            proxy.__proto__ = target.__proto__;
        } else {
            prototypeOk = false;
        }
        if (handler.get || !prototypeOk) {
            for (var k in target) {
                if (propertyMap[k]) {
                    continue;
                }
                Object.defineProperty(proxy, k, {get: getter.bind(target, k)});
            }
        }

        // The Proxy polyfill cannot handle adding new properties. Seal the target and proxy.
        Object.seal(target);
        Object.seal(proxy);

        return proxy;  // nb. if isMethod is true, proxy != this
    };

    scope.Proxy.revocable = function(target, handler) {
        var p = new scope.Proxy(target, handler);
        return {'proxy': p, 'revoke': lastRevokeFn};
    };

    scope.Proxy['revocable'] = scope.Proxy.revocable;
    scope['Proxy'] = scope.Proxy;
})(typeof process !== 'undefined' && {}.toString.call(process) === '[object process]' ? global : self);

(function(win) {
    win.console.log(navigator.userAgent);

    win.Capacitor = win.Capacitor || {
        Plugins: {}
    };

    var capacitor = Capacitor;

    // Export Cordova if not defined
    win.cordova = win.cordova || {};

    capacitor.Plugins = capacitor.Plugins || {};

    capacitor.DEBUG = typeof capacitor.DEBUG === 'undefined' ? true : capacitor.DEBUG;

    // keep a collection of callbacks for native response data
    var calls = {};

    // Counter of callback ids, randomized to avoid
    // any issues during reloads if a call comes back with
    // an existing callback id from an old session
    var callbackIdCount = Math.floor(Math.random() * 134217728);

    var lastError = null;
    var errorModal = null;

    // create the postToNative() fn if needed
    if (win.androidBridge) {
        // android platform
        postToNative = function androidBridge(data) {
            win.androidBridge.postMessage(JSON.stringify(data));
        };
        capacitor.isNative = true;
        capacitor.isAndroid = true;
        capacitor.platform = 'android';

    } else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
        // ios platform
        postToNative = function iosBridge(data) {
            data.type = 'message';
            win.webkit.messageHandlers.bridge.postMessage(data);
        };
        capacitor.isNative = true;
        capacitor.isIOS = true;
        capacitor.platform = 'ios';
    }

    // patch window.console and store original console fns
    var orgConsole = {};
    Object.keys(win.console).forEach(function(level) {
        if (typeof win.console[level] === 'function') {
            // loop through all the console functions and keep references to the original
            orgConsole[level] = win.console[level];

            win.console[level] = function capacitorConsole() {
                var msgs = Array.prototype.slice.call(arguments);

                // console log to browser
                orgConsole[level].apply(win.console, msgs);

                if (capacitor.isNative) {
                    // send log to native to print
                    try {
                        // convert all args to strings
                        msgs = msgs.map(function(arg) {
                            if (typeof arg === 'object') {
                                try {
                                    arg = JSON.stringify(arg);
                                } catch (e) {}
                            }
                            // convert to string
                            return arg + '';
                        });
                        capacitor.toNative('Console', 'log', {
                            level: level,
                            message: msgs.join(' ')
                        });

                    } catch (e) {
                        // error converting/posting console messages
                        orgConsole.error.apply(win.console, e);
                    }
                }
            };
        }
    });

    /**
     * Send a plugin method call to the native layer
     */
    capacitor.toNative = function toNative(pluginId, methodName, options, storedCallback) {
        try {
            if (capacitor.isNative) {
                var callbackId = '-1';

                if (storedCallback && (typeof storedCallback.callback === 'function' || typeof storedCallback.resolve === 'function')) {
                    // store the call for later lookup
                    callbackId = ++callbackIdCount + '';
                    calls[callbackId] = storedCallback;
                }

                var call = {
                    callbackId: callbackId,
                    pluginId: pluginId,
                    methodName: methodName,
                    options: options || {}
                };

                if (capacitor.DEBUG) {
                    if (pluginId !== 'Console') {
                        capacitor.logToNative(call);
                    }
                }

                // post the call data to native
                postToNative(call);

                return callbackId;

            } else {
                orgConsole.warn.call(win.console, 'browser implementation unavailable for: '+pluginId+'}');
            }

        } catch (e) {
            orgConsole.error.call(win.console, e);
        }

        return null;
    };

    /**
     * Process a response from the native layer.
     */
    capacitor.fromNative = function fromNative(result) {
        if (capacitor.DEBUG) {
            if (result.pluginId !== 'Console') {
                capacitor.logFromNative(result);
            }
        }
        // get the stored call, if it exists
        try {
            var storedCall = calls[result.callbackId];

            if (storedCall) {
                // looks like we've got a stored call

                if (typeof storedCall.callback === 'function') {
                    // callback
                    if (result.success) {
                        storedCall.callback(result.data);
                    } else {
                        storedCall.callback(null, result.error);
                    }

                } else if (typeof storedCall.resolve === 'function') {
                    // promise
                    if (result.success) {
                        storedCall.resolve(result.data);
                    } else {
                        storedCall.reject(result.error);
                    }

                    // no need to keep this stored callback
                    // around for a one time resolve promise
                    delete calls[result.callbackId];
                }

            } else if (!result.success && result.error) {
                // no stored callback, but if there was an error var's log it
                orgConsole.warn.call(win.console, result.error);
            }

            if (result.save === false) {
                delete calls[result.callbackId];
            }

        } catch (e) {
            orgConsole.error.call(win.console, e);
        }

        // always delete to prevent memory leaks
        // overkill but we're not sure what apps will do with this data
        delete result.data;
        delete result.error;
    };

    capacitor.withPlugin = function withPlugin(_pluginId, _fn) {
    };

    capacitor.nativeCallback = function (pluginId, methodName, options, callback) {
        if(typeof options === 'function') {
            callback = options;
            options = null;
        }
        return capacitor.toNative(pluginId, methodName, options, {
            callback: callback
        });
    };

    capacitor.nativePromise = function (pluginId, methodName, options) {
        return new Promise(function(resolve, reject) {
            capacitor.toNative(pluginId, methodName, options, {
                resolve: resolve,
                reject: reject
            });
        });
    };

    capacitor.addListener = function(pluginId, eventName, callback) {
        var callbackId = capacitor.nativeCallback(pluginId, 'addListener', {
            eventName: eventName
        }, callback);
        return {
            remove: function() {
                console.log('Removing listener', pluginId, eventName);
                capacitor.removeListener(pluginId, callbackId, eventName, callback);
            }
        }
    };

    capacitor.removeListener = function(pluginId, callbackId, eventName, callback) {
        capacitor.nativeCallback(pluginId, 'removeListener', {
            callbackId: callbackId,
            eventName: eventName
        }, callback);
    }

    capacitor.handleError = function(error) {
        console.error(error);

        if (!Capacitor.DEBUG) {
            return;
        }

        if(!errorModal) {
            errorModal = makeErrorModal(error);
        }

        errorModal.style.display = 'block';
        updateErrorModal(error);
    }

    capacitor.handleWindowError = function (msg, url, lineNo, columnNo, error) {
        var string = msg.toLowerCase();
        var substring = "script error";
        if (string.indexOf(substring) > -1) {
            // Some IE issue?
        } else {
            var errObj = {
                type: 'js.error',
                error: {
                    message: msg,
                    url: url,
                    line: lineNo,
                    col: columnNo,
                    errorObject: JSON.stringify(error)
                }
            };

            console.error(error);

            win.Capacitor.handleError(error);
            if(capacitor.isAndroid) {
                win.androidBridge.postMessage(JSON.stringify(errObj));
            } else if(capacitor.isIOS) {
                win.webkit.messageHandlers.bridge.postMessage(errObj);
            }
        }

        return false;
    };

    capacitor.logToNative = function(call) {
        if(Object.keys(orgConsole).length > 0) {
            var c = orgConsole;
            c.groupCollapsed('%cnative %c' + call.pluginId + '.' + call.methodName + ' (#' + call.callbackId + ')',
                'font-weight: lighter; color: gray', 'font-weight: bold; color: #000');
            c.dir(call);
            c.groupEnd();
            //orgConsole.log('LOG TO NATIVE', call);
        } else {
            win.console.log('LOG TO NATIVE: ', call);
            if (capacitor.isNative) {
                try {
                    capacitor.toNative('Console', 'log', {message: JSON.stringify(call)});
                } catch (e) {
                    win.console.log('Error converting/posting console messages');
                }
            }
        }
    }

    capacitor.logFromNative = function(result) {
        if(Object.keys(orgConsole).length > 0) {
            var c = orgConsole;

            var success = result.success === true;

            var tagStyles = success ? 'font-style: italic; font-weight: lighter; color: gray' :
                'font-style: italic; font-weight: lighter; color: red';

            c.groupCollapsed('%cresult %c' + result.pluginId + '.' + result.methodName + ' (#' + result.callbackId + ')',
                tagStyles,
                'font-style: italic; font-weight: bold; color: #444');
            if (result.success === false) {
                c.error(result.error);
            } else {
                c.dir(result.data);
            }
            c.groupEnd();
        } else {
            if (result.success === false) {
                win.console.error(result.error);
            } else {
                win.console.log(result.data);
            }
        }
    }

    capacitor.uuidv4 = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    if (Capacitor.DEBUG) {
        window.onerror = capacitor.handleWindowError;
    }

    function injectCSS() {
        var css =
            '._avc-modal {' +
            (capacitor.isIOS ? 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";' : 'font-family: "Roboto", "Helvetica Neue", sans-serif;') +
            'position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 9999;}' +
            ' ._avc-modal-wrap {position: relative;width: 100%;height: 100%;} '+
            '._avc-modal-header {font-size: 16px;position: relative;' +
            (capacitor.isIOS ? 'padding: 32px 15px;-webkit-backdrop-filter: blur(10px);background-color: rgba(255, 255, 255, 0.5);' : 'background-color: #eee;height: 60px;padding: 15px;') +
            '}' +
            ' ._avc-modal-content {width: 100%;height: 100%;padding: 15px;-webkit-backdrop-filter: blur(10px);' +
            (capacitor.isIOS ? 'background-color: rgba(255, 255, 255, 0.5);' : 'background-color: white;') +
            'overflow: auto;-webkit-overflow-scrolling: touch;} ' +
            '._avc-modal-header-button {position: absolute;font-size: 16px;right: 15px;padding: 0px 10px;' +
            (capacitor.isIOS ? 'top: 30px;' : 'top: 10px;height: 40px;') +
            '} ' +
            '._avc-modal-title {' +
            (capacitor.isIOS ? 'position: absolute;text-align: center;width: 100px;left: 50%;margin-left: -50px;' : 'margin-top: 7px;') +
            'font-weight: 600;} ' +
            '._avc-error-content {font-size: 14px;margin-bottom: 50px;} ._avc-error-message {font-size: 16px;font-weight: 600; margin-bottom: 10px;} ._avc-button {padding: 15px;font-size: 14px;border-radius: 3px;background-color: #222;} ' +
            '#_avc-copy-error {position: absolute;bottom: 0;left: 15px;right: 15px; ' +
            (capacitor.isAndroid ? 'bottom: 15px;width: calc(100% - 30px);' : '') +
            'background-color: #e83d3d;color: #fff;font-weight: bold;margin-top: 15px;}';
        var style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    function makeModal() {
        injectCSS();
        var html = '<div class="_avc-modal-wrap"> <div class="_avc-modal-header"> <div class="_avc-modal-title">Error</div> <button type="button" id="_avc-modal-close" class="_avc-modal-header-button">Close</button> </div> <div class="_avc-modal-content"> <div class="_avc-error-output"></div> </div> <button type="button" class="_avc-button" id="_avc-copy-error">Copy Error</button> </div>'
        var el = document.createElement('div');
        el.innerHTML = html;
        el.className ="_avc-modal";

        var closeButton = el.querySelector('#_avc-modal-close');
        closeButton.addEventListener('click', function(e) {
            el.style.display = 'none';
        })

        var copyButton = el.querySelector('#_avc-copy-error');
        copyButton.addEventListener('click', function(e) {
            if(lastError) {
                Capacitor.Plugins.Clipboard.set({
                    string: lastError.message + '\n' + lastError.stack
                });
            }
        });

        return el;
    }

    function makeErrorModal(error) {
        var modalEl = makeModal();
        modalEl.id = "_avc-error";
        document.body.appendChild(modalEl);
        return modalEl;
    }

    function updateErrorModal(error) {
        if(!errorModal) { return; }

        if (typeof error === 'string') {
            return;
        }

        lastError = error;

        var message = error.message;
        if(error.rejection) {
            message = 'Promise rejected: ' + error.rejection.message + "<br />" + message;
        }

        var stack = error.stack;
        var stackLines = cleanStack(stack);
        var stackHTML = stackLines.join('<br />');

        var content = errorModal.querySelector('._avc-error-output');
        content.innerHTML = '<div class="_avc-error-content"> <div class="_avc-error-message"></div><div class="_avc-error-stack"></div></div>';
        var messageEl = content.querySelector('._avc-error-message');
        var stackEl = content.querySelector('._avc-error-stack');
        messageEl.innerHTML = message;
        stackEl.innerHTML = stackHTML;
    }

    function cleanStack(stack) {
        var lines = stack.split('\n');
        return lines.map(function(line) {
            var atIndex = line.indexOf('@');
            var appIndex = line.indexOf('.app');

            // Remove the big long iOS path
            if(atIndex >= 0 && appIndex >= 0) {
                //var badSubstr = line.substring(atIndex, appIndex + 5);
                line = '<b>' + line.substring(0, atIndex) + '</b>' + '@' + line.substring(appIndex + 5);
            }
            return line;
        });
    }

})(window);
