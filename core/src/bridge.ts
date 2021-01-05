import type {
  CallData,
  CapacitorInstance,
  WindowCapacitor,
  PluginResult,
  StoredCallback,
} from './definitions-internal';
import { initLogger } from './logger';
import { CapacitorException, ExceptionCode } from './util';

export const initBridge = (
  win: WindowCapacitor,
  cap: CapacitorInstance,
): void => {
  // keep a collection of callbacks for native response data
  const callbacks = new Map<string, StoredCallback>();

  // Counter of callback ids, randomized to avoid
  // any issues during reloads if a call comes back with
  // an existing callback id from an old session
  let callbackIdCount = Math.floor(Math.random() * 134217728);

  let postToNative: (data: CallData) => void | null = null;

  // create the postToNative() fn if needed
  if (win.androidBridge) {
    // android platform
    postToNative = (data: any) => {
      try {
        win.androidBridge.postMessage(JSON.stringify(data));
      } catch (e) {
        win?.console?.error(e);
      }
    };
  } else if (win.webkit?.messageHandlers?.bridge) {
    // ios platform
    postToNative = (data: any) => {
      try {
        data.type = 'message';
        win.webkit.messageHandlers.bridge.postMessage(data);
      } catch (e) {
        win?.console?.error(e);
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
        postToNative(errObj as any);
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
  cap.toNative = (
    pluginName: string,
    methodName: string,
    options: any,
    storedCallback: StoredCallback,
  ) => {
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

        const callData: CallData = {
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
        win?.console?.warn(`implementation unavailable for: ${pluginName}`);
      }
    } catch (e) {
      win?.console?.error(e);
    }

    return null;
  };

  /**
   * Process a response from the native layer.
   */
  cap.fromNative = (result: PluginResult) => {
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
            err[key] = (result.error as any)[key];
            return err;
          }, new cap.Exception('') as any);
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
        win?.console?.warn(result.error);
      }

      if (result.save === false) {
        callbacks.delete(result.callbackId);
      }
    } catch (e) {
      win?.console?.error(e);
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
        callback = options;
        options = null;
      }
      return cap.toNative(pluginName, methodName, options, {
        callback: callback,
      });
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
        ExceptionCode.Unimplemented,
      );
    };
    cap.nativePromise = () =>
      Promise.reject(
        new CapacitorException(
          `nativePromise() not implemented`,
          ExceptionCode.Unimplemented,
        ),
      );
  }
};

export const getPlatformId = (win: WindowCapacitor): string => {
  if (win.androidBridge) {
    return 'android';
  }
  if (win.webkit?.messageHandlers?.bridge) {
    return 'ios';
  }
  return 'web';
};
