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

  // patch window.console and store original console fns
  var orgConsole = {};
  Object.keys(win.console).forEach(level => {
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
            msgs = msgs.map(arg => {
              if (typeof arg === 'object') {
                try {
                  arg = JSON.stringify(arg);
                } catch (e) {}
              }
              // convert to string
              return arg + '';
          });
            capacitor.toNative('Console', 'log', {
              level,
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

  function addLegacyHandlers(win) {
    win.navigator.app = {
      exitApp: function() {
        capacitor.toNative("App", "exitApp", {}, null);
      }
    }
    let documentAddEventListener = document.addEventListener;
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
          callbackId,
          pluginId,
          methodName,
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
        orgConsole.warn.call(win.console, `browser implementation unavailable for: ${pluginId}`);
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
      const storedCall = calls[result.callbackId];

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
      callback
    });
  };

  capacitor.nativePromise = function (pluginId, methodName, options) {
    return new Promise((resolve, reject) => {
      capacitor.toNative(pluginId, methodName, options, {
        resolve,
        reject
      });
    });
  };


  capacitor.addListener = function(pluginId, eventName, callback) {
    var callbackId = capacitor.nativeCallback(pluginId, 'addListener', {
      eventName
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
      callbackId,
      eventName
    }, callback);
  }

  capacitor.triggerEvent = function(eventName, target, data) {
    var event = new CustomEvent(eventName, { detail: data || {} });
    if (target === "document") {
      document.dispatchEvent(event);
    } else if (target === "window") {
      window.dispatchEvent(event);
    } else {
      const targetEl = document.querySelector(target);
      targetEl && targetEl.dispatchEvent(event);
    }
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
    if(!useFallbackLogging) {
        var c = orgConsole;
        c.groupCollapsed(`%cnative %c${call.pluginId}.${call.methodName} (#${call.callbackId})`,
            `font-weight: lighter; color: gray`, `font-weight: bold; color: #000`);
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

  function injectCSS() {
    var css = `
    ._avc-modal {
      ${capacitor.isIOS ? `
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
      ` : `
      font-family: "Roboto", "Helvetica Neue", sans-serif;
      `}
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 9999;
    }
    ._avc-modal-wrap {
      position: relative;
      width: 100%;
      height: 100%;
    }
    ._avc-modal-header {
      font-size: 16px;
      position: relative;
      ${capacitor.isIOS ? `
      padding: 32px 15px;
      -webkit-backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.5);
      ` : `
      background-color: #eee;
      height: 60px;
      padding: 15px;
      `}
    }
    ._avc-modal-content {
      width: 100%;
      height: 100%;
      padding: 15px;
      -webkit-backdrop-filter: blur(10px);
      ${capacitor.isIOS ? `
      background-color: rgba(255, 255, 255, 0.5);
      ` : `
      background-color: white;
      `}
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    ._avc-modal-header-button {
      position: absolute;
      font-size: 16px;
      right: 15px;
      padding: 0px 10px;
      ${capacitor.isIOS ? `
      top: 30px;
      ` : `
      top: 10px;
      height: 40px;
      `}
    }
    ._avc-modal-title {
      ${capacitor.isIOS ? `
      position: absolute;
      text-align: center;
      width: 100px;
      left: 50%;
      margin-left: -50px;
      ` : `
      margin-top: 7px;
      `}
      font-weight: 600;
    }
    ._avc-error-content {
      font-size: 14px;
      margin-bottom: 50px;
    }
    ._avc-error-message {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    ._avc-button {
      padding: 15px;
      font-size: 14px;
      border-radius: 3px;
      background-color: #222;
    }
    #_avc-copy-error {
      position: absolute;
      bottom: 0;
      left: 15px;
      right: 15px;
      ${capacitor.isAndroid ? `
      bottom: 15px;
      width: calc(100% - 30px);
      ` : ``}
      background-color: #e83d3d;
      color: #fff;
      font-weight: bold;
      margin-top: 15px;
    }
    `
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  function makeModal() {
    injectCSS();
    var html = `
      <div class="_avc-modal-wrap">
        <div class="_avc-modal-header">
          <div class="_avc-modal-title">Error</div>
          <button type="button" id="_avc-modal-close" class="_avc-modal-header-button">Close</button>
        </div>
        <div class="_avc-modal-content">
          <div class="_avc-error-output"></div>
        </div>
        <button type="button" class="_avc-button" id="_avc-copy-error">Copy Error</button>
      </div>
    `
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
        Capacitor.Plugins.Clipboard.write({
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
      message = `Promise rejected: ${error.rejection.message}` + "<br />" + message;
    }

    var stack = error.stack;
    var stackLines = cleanStack(stack);
    var stackHTML = stackLines.join('<br />');

    var content = errorModal.querySelector('._avc-error-output');
    content.innerHTML = `
    <div class="_avc-error-content">
      <div class="_avc-error-message"></div>
      <div class="_avc-error-stack"></div>
    </div>
    `;
    var messageEl = content.querySelector('._avc-error-message');
    var stackEl = content.querySelector('._avc-error-stack');
    messageEl.innerHTML = message;
    stackEl.innerHTML = stackHTML;
  }

  function cleanStack(stack) {
    var lines = stack.split('\n');
    return lines.map((line) => {
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

