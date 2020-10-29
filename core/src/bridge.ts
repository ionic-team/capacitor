import type {
  CallData,
  CapacitorInstance,
  GlobalInstance,
  InternalState,
  PluginResult,
  StoredCallback,
} from './definitions';
import { initLogger } from './logger';

export const initBridge = (
  gbl: GlobalInstance,
  instance: CapacitorInstance,
  state: InternalState,
) => {
  // keep a collection of callbacks for native response data
  const callbacks = new Map<string, StoredCallback>();

  // Counter of callback ids, randomized to avoid
  // any issues during reloads if a call comes back with
  // an existing callback id from an old session
  let callbackIdCount = Math.floor(Math.random() * 134217728);

  let postToNative: (data: CallData) => void | null = null;

  // create the postToNative() fn if needed
  if (gbl.androidBridge) {
    // android platform
    postToNative = (data: any) => {
      gbl.androidBridge.postMessage(JSON.stringify(data));
    };
    state.isNative = true;
    state.platform = 'android';
  } else if (
    gbl.webkit &&
    gbl.webkit.messageHandlers &&
    gbl.webkit.messageHandlers.bridge
  ) {
    // ios platform
    postToNative = (data: any) => {
      data.type = 'message';
      gbl.webkit.messageHandlers.bridge.postMessage(data);
    };
    state.isNative = true;
    state.platform = 'ios';
  }

  const logger = initLogger(gbl, instance, state, postToNative);

  /**
   * Send a plugin method call to the native layer
   */
  instance.toNative = (
    pluginId: string,
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
          pluginId: pluginId,
          methodName: methodName,
          options: options || {},
        };

        if (
          instance.DEBUG &&
          pluginId !== 'Console' &&
          typeof instance.logToNative === 'function'
        ) {
          instance.logToNative(callData);
        }

        // post the call data to native
        postToNative(callData);

        return callbackId;
      } else {
        logger('warn', `implementation unavailable for: ${pluginId}`);
      }
    } catch (e) {
      logger('error', e);
    }

    return null;
  };

  /**
   * Process a response from the native layer.
   */
  instance.fromNative = (result: PluginResult) => {
    if (
      instance.DEBUG &&
      result.pluginId !== 'Console' &&
      typeof instance.logFromNative === 'function'
    ) {
      instance.logFromNative(result);
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
          }, new instance.Exception('') as any);
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
        logger('warn', result.error);
      }

      if (result.save === false) {
        callbacks.delete(result.callbackId);
      }
    } catch (e) {
      logger('error', e);
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  };

  instance.nativeCallback = (pluginId, methodName, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    return instance.toNative(pluginId, methodName, options, {
      callback: callback,
    });
  };

  instance.nativePromise = (pluginId, methodName, options) => {
    return new Promise((resolve, reject) => {
      instance.toNative(pluginId, methodName, options, {
        resolve: resolve,
        reject: reject,
      });
    });
  };
};
