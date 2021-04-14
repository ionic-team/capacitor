class CapacitorException extends Error {
  constructor(message, code) {
    super(message);
  }
}

const getPlatformId = (win) => {
  if (win.androidBridge) {
    return 'android';
  } else if (
    win.webkit &&
    win.webkit.messageHandlers &&
    win.webkit.messageHandlers.bridge
  ) {
    return 'ios';
  } else {
    return 'web';
  }
};

const initLogger = (win) => {
  const cap = win.Capacitor || {};

  const BRIDGED_CONSOLE_METHODS = [
    'debug',
    'error',
    'info',
    'log',
    'trace',
    'warn',
  ];

  const createLogFromNative = c => result => {
    if (isFullConsole(c)) {
      const success = result.success === true;

      const tagStyles = success
        ? 'font-style: italic; font-weight: lighter; color: gray'
        : 'font-style: italic; font-weight: lighter; color: red';

      c.groupCollapsed(
        '%cresult %c' +
          result.pluginId +
          '.' +
          result.methodName +
          ' (#' +
          result.callbackId +
          ')',
        tagStyles,
        'font-style: italic; font-weight: bold; color: #444',
      );
      if (result.success === false) {
        c.error(result.error);
      } else {
        c.dir(result.data);
      }
      c.groupEnd();
    } else {
      if (result.success === false) {
        c.error('LOG FROM NATIVE', result.error);
      } else {
        c.log('LOG FROM NATIVE', result.data);
      }
    }
  };

  const createLogToNative = c => call => {
    if (isFullConsole(c)) {
      c.groupCollapsed(
        '%cnative %c' +
          call.pluginId +
          '.' +
          call.methodName +
          ' (#' +
          call.callbackId +
          ')',
        'font-weight: lighter; color: gray',
        'font-weight: bold; color: #000',
      );
      c.dir(call);
      c.groupEnd();
    } else {
      c.log('LOG TO NATIVE: ', call);
    }
  };

  const isFullConsole = c => {
    if (!c) {
      return false;
    }

    return (
      typeof c.groupCollapsed === 'function' ||
      typeof c.groupEnd === 'function' ||
      typeof c.dir === 'function'
    );
  };

  const serializeConsoleMessage = msg => {
    if (typeof msg === 'object') {
      try {
        msg = JSON.stringify(msg);
      } catch (e) {
        // ignore
      }
    }

    return String(msg);
  };

  // patch window.console on iOS and store original console fns
  const isIos = getPlatformId(win) === 'ios';
  const originalConsole = { ...win.console };

  if (win.console && isIos) {
    for (const logfn of BRIDGED_CONSOLE_METHODS) {
      win.console[logfn] = (...args) => {
        const msgs = [...args];

        originalConsole[logfn](...msgs);

        try {
          cap.toNative('Console', 'log', {
            level: logfn,
            message: msgs.map(serializeConsoleMessage).join(' '),
          });
        } catch (e) {
          // error converting/posting console messages
          originalConsole.error(e);
        }
      };
    }
  }

  cap.logToNative = createLogToNative(win.console);
  cap.logFromNative = createLogFromNative(win.console);

  win.Capacitor = cap;
};

const initBridge = (win) => {
  const cap = win.Capacitor || {};

  // keep a collection of callbacks for native response data
  const callbacks = new Map();

  // Counter of callback ids, randomized to avoid
  // any issues during reloads if a call comes back with
  // an existing callback id from an old session
  let callbackIdCount = Math.floor(Math.random() * 134217728);

  let postToNative = null;

  // create the postToNative() fn if needed
  if (getPlatformId(win) === 'android') {
    // android platform
    postToNative = data => {
      try {
        win.androidBridge.postMessage(JSON.stringify(data));
      } catch (e) {
        if (win && win.console && win.console.error) {
          win.console.error(e);
        }
      }
    };
  } else if (getPlatformId(win) === 'ios') {
    // ios platform
    postToNative = data => {
      try {
        data.type = data.type ? data.type : 'message';
        win.webkit.messageHandlers.bridge.postMessage(data);
      } catch (e) {
        if (win && win.console && win.console.error) {
          win.console.error(e);
        }
      }
    };
  }

  cap.handleWindowError = (msg, url, lineNo, columnNo, err) => {
    const str = msg.toLowerCase();

    if (str.indexOf('script error') > -1) {
      // Some IE issue?
    } else {
      const errObj = {
        type: 'js.error',
        error: {
          message: msg,
          url: url,
          line: lineNo,
          col: columnNo,
          errorObject: JSON.stringify(err),
        },
      };

      if (err !== null) {
        cap.handleError(err);
      }

      if (postToNative) {
        postToNative(errObj);
      }
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
  cap.toNative = (pluginName, methodName, options, storedCallback) => {
    try {
      if (typeof postToNative === 'function') {
        let callbackId = '-1';

        if (
          storedCallback &&
          (typeof storedCallback.callback === 'function' ||
            typeof storedCallback.resolve === 'function')
        ) {
          // store the call for later lookup
          callbackId = String(++callbackIdCount);
          callbacks.set(callbackId, storedCallback);
        }

        const callData = {
          callbackId: callbackId,
          pluginId: pluginName,
          methodName: methodName,
          options: options || {},
        };

        if (cap.DEBUG && pluginName !== 'Console') {
          cap.logToNative(callData);
        }

        // post the call data to native
        postToNative(callData);

        return callbackId;
      } else {
        if (win && win.console && win.console.warn) {
          win.console.warn(`implementation unavailable for: ${pluginName}`);
        }
      }
    } catch (e) {
      if (win && win.console && win.console.error) {
        win.console.error(e);
      }
    }

    return null;
  };

  /**
   * Process a response from the native layer.
   */
  cap.fromNative = result => {
    if (cap.DEBUG && result.pluginId !== 'Console') {
      cap.logFromNative(result);
    }

    // get the stored call, if it exists
    try {
      const storedCall = callbacks.get(result.callbackId);

      if (storedCall) {
        // looks like we've got a stored call

        if (result.error) {
          // ensure stacktraces by copying error properties to an Error
          result.error = Object.keys(result.error).reduce((err, key) => {
            err[key] = result.error[key];
            return err;
          }, new cap.Exception(''));
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
          callbacks.delete(result.callbackId);
        }
      } else if (!result.success && result.error) {
        // no stored callback, but if there was an error let's log it
        if (win && win.console && win.console.warn) {
          win.console.warn(result.error);
        }
      }

      if (result.save === false) {
        callbacks.delete(result.callbackId);
      }
    } catch (e) {
      if (win && win.console && win.console.error) {
        win.console.error(e);
      }
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  };

  if (typeof postToNative === 'function') {
    // toNative bridge found
    cap.nativeCallback = (pluginName, methodName, options, callback) => {
      if (typeof options === 'function') {
        console.warn(
          `Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated.`,
        );

        callback = options;
        options = null;
      }

      return cap.toNative(pluginName, methodName, options, { callback });
    };

    cap.nativePromise = (pluginName, methodName, options) => {
      return new Promise((resolve, reject) => {
        cap.toNative(pluginName, methodName, options, {
          resolve: resolve,
          reject: reject,
        });
      });
    };
  } else {
    // no native bridge created
    cap.nativeCallback = () => {
      throw new CapacitorException(
        `nativeCallback() not implemented`,
        'UNIMPLEMENTED',
      );
    };
    cap.nativePromise = () =>
      Promise.reject(
        new CapacitorException(
          `nativePromise() not implemented`,
          'UNIMPLEMENTED',
        ),
      );
  }

  win.Capacitor = cap;
};

initBridge(typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
  ? global
  : {}
)

// UMD export for tests
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.returnExports = factory();
  }
})(this, function () {
  return initBridge;
});
