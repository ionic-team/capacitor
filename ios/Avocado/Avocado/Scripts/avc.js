(function(win) {
  win.Avocado = win.Avocado || {};

  // keep a collection of callbacks for native response data
  var calls = {};

  // keep a counter of callback ids
  var callbackIdCount = 0;

  var avocado = Avocado;

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

      } else {
        orgConsole.warn.call(win.console, `browser implementation unavailable for: ${pluginId}`);
      }

    } catch (e) {
      orgConsole.error.call(win.console, e);
    }
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
    avocado.toNative(pluginId, methodName, options, {
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
      window.Avocado.handleError(errObj);
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
    ._avc-modal-header {
      padding: 32px 15px;
      font-size: 16px;
      position: relative;
      -webkit-backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.3);
    }
    ._avc-modal-content {
      width: 100%;
      height: 100%;
      -webkit-backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.3);
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
    `
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  function makeModal() {
    injectCSS();
    var html = `
      <div class="_avc-modal-header">
        <div class="_avc-modal-title">Error</div>
        <button type="button" class="_avc-modal-header-button">Close</button>
      </div>
      <div class="_avc-modal-content">
      </div>
    `
    var el = document.createElement('div');
    el.innerHTML = html;
    el.className ="_avc-modal";
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

    var message = error.message;
    var stack = error.stack;
    var stackLines = stack.split('\n');
    var stackHTML = stackLines.join('<br />');

    var content = errorModal.querySelector('._avc-modal-content');
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
})(window);
