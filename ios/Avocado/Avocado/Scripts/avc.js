(function(win) {
  win.Avocado = win.Avocado || {};

  // keep a collection of callbacks for native response data
  var calls = {};

  // keep a counter of callback ids
  var callbackIdCount = 0;

  var avocado = Avocado;

  var lastError = null;
  var errorModal = null;

  // create the postToNative() fn if needed
  if (win.androidBridge) {
    // android platform
    postToNative = function androidBridge(data) {
      win.androidBridge.postMessage(JSON.stringify(data));
    };
    avocado.isNative = true;
    avocado.platform = 'android';

  } else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
    // ios platform
    postToNative = function iosBridge(data) {
      data.type = 'message';
      win.webkit.messageHandlers.bridge.postMessage(data);
    };
    avocado.isNative = true;
    avocado.platform = 'ios';
  }

  // patch window.console and store original console fns
  var orgConsole = {};
  Object.keys(win.console).forEach(level => {
    if (typeof win.console[level] === 'function') {
      // loop through all the console functions and keep references to the original
      orgConsole[level] = win.console[level];

      win.console[level] = function avocadoConsole() {
        var msgs = Array.prototype.slice.call(arguments);

        // console log to browser
        orgConsole[level].apply(win.console, msgs);

        if (avocado.isNative) {
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
            avocado.toNative('Console', 'log', {
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

  /**
   * Send a plugin method call to the native layer
   */
  avocado.toNative = function toNative(pluginId, methodName, options, storedCallback) {
    try {
      if (avocado.isNative) {
        let callbackId = '-1';

        if (storedCallback && (typeof storedCallback.callback === 'function' || typeof storedCallback.resolve === 'function')) {
          // store the call for later lookup
          callbackId = ++callbackIdCount + '';
          calls[callbackId] = storedCallback;
        }

        // post the call data to native
        postToNative({
          callbackId,
          pluginId,
          methodName,
          options: options || {}
        });

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
  avocado.fromNative = function fromNative(result) {
    // get the stored call, if it exists
    try {
      const storedCall = calls[result.callbackId];

      if (storedCall) {
        // looks like we've got a stored call

        if (typeof storedCall.callback === 'function') {
          // callback
          if (result.success) {
            storedCall.callback(null, result.data);
          } else {
            storedCall.callback(result.error, null);
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

    } catch (e) {
      orgConsole.error.call(win.console, e);
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  };

  avocado.withPlugin = function withPlugin(_pluginId, _fn) {
  };

  avocado.nativeCallback = function (pluginId, methodName, options, callback) {
    if(typeof options === 'function') {
      callback = options;
      options = null;
    }
    return avocado.toNative(pluginId, methodName, options, {
      callback
    });
  };

  avocado.nativePromise = function (pluginId, methodName, options) {
    return new Promise((resolve, reject) => {
      avocado.toNative(pluginId, methodName, options, {
        resolve,
        reject
      });
    });
  };


  avocado.addListener = function(pluginId, eventName, callback) {
    var callbackId = avocado.nativeCallback(pluginId, 'addListener', {
      eventName
    }, callback);
    return {
      remove: function() {
        console.log('Removing listener', pluginId, eventName);
        avocado.removeListener(pluginId, callbackId, eventName, callback);
      }
    }
  };

  avocado.removeListener = function(pluginId, callbackId, eventName, callback) {
    avocado.nativeCallback(pluginId, 'removeListener', {
      callbackId,
      eventName
    }, callback);
  }

  avocado.handleError = function(error) {
    if(!errorModal) {
      errorModal = makeErrorModal(error);
    }
      
    errorModal.style.display = 'block';
    updateErrorModal(error);
  }
 
 
  avocado.handleWindowError = function (msg, url, lineNo, columnNo, error) {
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
      window.Avocado.handleError(error);
      window.webkit.messageHandlers.avocado.postMessage(errObj);
    }

    return false;
  };

  window.onerror = avocado.handleWindowError;

  function injectCSS() {
    var css = `
    ._avc-modal {
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
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
      padding: 32px 15px;
      font-size: 16px;
      position: relative;
      -webkit-backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.5);
    }
    ._avc-modal-content {
      width: 100%;
      height: 100%;
      padding: 15px;
      -webkit-backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.5);
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    ._avc-modal-header-button {
      float: right;
      font-size: 16px;
    }
    ._avc-modal-title {
      position: absolute;
      text-align: center;
      width: 100px;
      left: 50%;
      margin-left: -50px;
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
        Avocado.Plugins.Clipboard.set({
          string: lastError.message + '\n' + lastError.stack
        });
      }
    });

    return el;
  }

  function makeErrorModal(error) {
    console.log('Making modal for error', error);
    var modalEl = makeModal();
    modalEl.id = "_avc-error";
    document.body.appendChild(modalEl);
    return modalEl;
  }

  function updateErrorModal(error) {
    if(!errorModal) { return; }

    lastError = error;

    var message = error.message;
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
