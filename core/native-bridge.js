//# sourceURL=capacitor-runtime.js

(function(win) {
  win.Capacitor = win.Capacitor || {
    Plugins: {}
  };

  var capacitor = Capacitor;

  // Export Cordova if not defined
  win.cordova = win.cordova || {};

  // Add any legacy handlers to keep Cordova compat 100% good
  addLegacyHandlers(win);

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

  var useFallbackLogging = Object.keys(win.console).length === 0;
  if(useFallbackLogging) {
    win.console.warn('Advance console logging disabled.')
  }

  // patch window.console on iOS and store original console fns
  var orgConsole = capacitor.isIOS ? {} : win.console;
  
  // list log functions bridged to native log
  var bridgedLevels = {
    debug: true,
    error: true,
    info: true,
    log: true,
    trace: true,
    warn: true,
  };
  if (capacitor.isIOS) {
    Object.keys(win.console).forEach(function (level) {
      if (typeof win.console[level] === 'function') {
        // loop through all the console functions and keep references to the original
        orgConsole[level] = win.console[level];
        win.console[level] = function capacitorConsole() {
          var msgs = Array.prototype.slice.call(arguments);

          // console log to browser
          orgConsole[level].apply(win.console, msgs);

          if (capacitor.isNative && bridgedLevels[level]) {
            // send log to native to print
            try {
              // convert all args to strings
              msgs = msgs.map(function (arg) {
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
  }

  function addLegacyHandlers(win) {
    win.navigator.app = {
      exitApp: function() {
        capacitor.toNative("App", "exitApp", {}, null);
      }
    }
    var documentAddEventListener = document.addEventListener;
    document.addEventListener = function() {
      var name = arguments[0];
      var handler = arguments[1];
      if (name === 'deviceready') {
        setTimeout(function() {
          handler && handler();
        });
      } else if (name === 'backbutton') {
        // Add a dummy listener so Capacitor doesn't do the default
        // back button action
        Capacitor.Plugins.App && Capacitor.Plugins.App.addListener('backButton', function() {});
      }
      return documentAddEventListener.apply(document, arguments);
    }
  }

  /*
   * Check if a Plugin is available
   */
  capacitor.isPluginAvailable = function isPluginAvailable(name) {
    return this.Plugins.hasOwnProperty(name);
  }

  capacitor.convertFileSrc = function convertFileSrc(url) {
    if (!url) {
      return url;
    }
    if (url.startsWith('/')) {
      return window.WEBVIEW_SERVER_URL + '/_capacitor_file_' + url;
    }
    if (url.startsWith('file://')) {
      return window.WEBVIEW_SERVER_URL + url.replace('file://', '/_capacitor_file_');
    }
    if (url.startsWith('content://')) {
      return window.WEBVIEW_SERVER_URL + url.replace('content:/', '/_capacitor_content_');
    }
    return url;
  }

  /*
   * Check running platform
   */
  capacitor.getPlatform = function getPlatform() {
    return this.platform;
  }

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
        orgConsole.warn.call(win.console, 'browser implementation unavailable for: ' + pluginId);
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

        if (result.error && typeof result.error === 'object') {
          // ensure stacktraces by copying error properties to an Error
          result.error = Object.keys(result.error).reduce(function(err, key) {
            err[key] = result.error[key];
            return err;
          }, new Error());
        }

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
        // no stored callback, but if there was an error let's log it
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

  capacitor.logJs = function(message, level) {
    switch (level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
      default:
        console.log(message);
    }
  }

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
    return new Promise(function (resolve, reject) {
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

  capacitor.createEvent = function(type, data) {
    var event = document.createEvent('Events');
    event.initEvent(type, false, false);
    if (data) {
      for (var i in data) {
        if (data.hasOwnProperty(i)) {
          event[i] = data[i];
        }
      }
    }
    return event;
  }

  capacitor.triggerEvent = function(eventName, target, data) {
    var eventData = data || {};
    var event = this.createEvent(eventName, eventData);
    if (target === "document") {
      if (cordova.fireDocumentEvent) {
        cordova.fireDocumentEvent(eventName, eventData);
      } else {
        document.dispatchEvent(event);
      }
    } else if (target === "window") {
      window.dispatchEvent(event);
    } else {
      var targetEl = document.querySelector(target);
      targetEl && targetEl.dispatchEvent(event);
    }
  }

  capacitor.handleError = function(error) {
    console.error(error);
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
      if (error !== null) {
        win.Capacitor.handleError(error);
      }
      if(capacitor.isAndroid) {
        win.androidBridge.postMessage(JSON.stringify(errObj));
      } else if(capacitor.isIOS) {
        win.webkit.messageHandlers.bridge.postMessage(errObj);
      }
    }

    return false;
  };

  capacitor.logToNative = function(call) {
    if(!useFallbackLogging) {
        var c = orgConsole;
        c.groupCollapsed('%cnative %c' + call.pluginId + '.' + call.methodName + ' (#' + call.callbackId + ')', 'font-weight: lighter; color: gray', 'font-weight: bold; color: #000');
        c.dir(call);
        c.groupEnd();
    } else {
        win.console.log('LOG TO NATIVE: ', call);
        if (capacitor.isIOS) {
            try {
                capacitor.toNative('Console', 'log', {message: JSON.stringify(call)});
            } catch (e) {
                win.console.log('Error converting/posting console messages');
            }
        }
    }
  }

  capacitor.logFromNative = function(result) {
      if(!useFallbackLogging) {
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

  win.Ionic = win.Ionic || {};
  win.Ionic.WebView = win.Ionic.WebView || {};

  win.Ionic.WebView.getServerBasePath = function(callback) {
    Capacitor.Plugins.WebView.getServerBasePath().then(function(result) {
      callback(result.path);
    });
  }

  win.Ionic.WebView.setServerBasePath = function (path) {
    Capacitor.Plugins.WebView.setServerBasePath({"path": path});
  }

  win.Ionic.WebView.persistServerBasePath = function () {
    Capacitor.Plugins.WebView.persistServerBasePath();
  }

  win.Ionic.WebView.convertFileSrc = function(url) {
    return Capacitor.convertFileSrc(url);
  }

})(window);

