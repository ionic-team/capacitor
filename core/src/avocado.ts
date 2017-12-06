import {
  Avocado,
  PluginCall,
  StoredCallbacks,
  WindowAvocado
} from './definitions';

declare var global: any;


(function(win: WindowAvocado) {
  if (win.avocado) {
    return;
  }

  // keep a collection of callbacks for native response data
  const calls: StoredCallbacks = {};

  // keep a counter of callback ids
  let callbackIdCount = 0;

  // create global
  const avocado: Avocado = win.avocado = {
    isNative: false,
    platform: 'browser'
  };

  // create the postToNative() fn if needed
  let postToNative: (call: PluginCall) => void;
  if (win.androidBridge) {
    // android platform
    postToNative = function androidBridge(data) {
      win.androidBridge.postMessage(JSON.stringify(data));
    };
    avocado.isNative = true;
    avocado.platform = 'android';

  } else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
    // ios platform
    postToNative = function iosBridge(data: any) {
      data.type = 'message';
      win.webkit.messageHandlers.bridge.postMessage(data);
    };
    avocado.isNative = true;
    avocado.platform = 'ios';
  }

  // patch window.console and store original console fns
  const orgConsole: { [level: string]: Function } = {};
  Object.keys(win.console).forEach(level => {
    if (typeof win.console[level] === 'function') {
      // loop through all the console functions and keep references to the original
      orgConsole[level] = win.console[level];

      win.console[level] = function avocadoConsole() {
        let msgs: any[] = Array.prototype.slice.call(arguments);

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
            avocado.toNative('com.avocadojs.plugin.console', 'log', {
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

})((typeof window !== 'undefined' ? window : global) as any);
