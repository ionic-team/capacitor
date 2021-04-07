const getPlatformId = win => {
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

const convertFileSrcServerUrl = (webviewServerUrl, filePath) => {
  if (typeof filePath === 'string') {
    if (filePath.startsWith('/')) {
      return webviewServerUrl + '/_capacitor_file_' + filePath;
    } else if (filePath.startsWith('file://')) {
      return (
        webviewServerUrl + filePath.replace('file://', '/_capacitor_file_')
      );
    } else if (filePath.startsWith('content://')) {
      return (
        webviewServerUrl + filePath.replace('content:/', '/_capacitor_content_')
      );
    }
  }
  return filePath;
};

class CapacitorException extends Error {
  constructor(message, code) {
    super(message);
  }
}

const initLogger = (win, cap) => {
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
  const isIos = cap.getPlatform() === 'ios';
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
};

const initEvents = (win, cap) => {
  const doc = win.document;
  const cordova = win.cordova;

  cap.addListener = (pluginName, eventName, callback) => {
    const callbackId = cap.nativeCallback(
      pluginName,
      'addListener',
      {
        eventName: eventName,
      },
      callback,
    );
    return {
      remove: async () => {
        if (win.console && win.console.debug) {
          win.console.debug('Removing listener', pluginName, eventName);
        }
        cap.removeListener(pluginName, callbackId, eventName, callback);
      },
    };
  };

  cap.removeListener = (pluginName, callbackId, eventName, callback) => {
    cap.nativeCallback(
      pluginName,
      'removeListener',
      {
        callbackId: callbackId,
        eventName: eventName,
      },
      callback,
    );
  };

  cap.createEvent = (eventName, eventData) => {
    if (doc) {
      const ev = doc.createEvent('Events');
      ev.initEvent(eventName, false, false);
      if (eventData && typeof eventData === 'object') {
        for (const i in eventData) {
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

  cap.triggerEvent = (eventName, target, eventData) => {
    eventData = eventData || {};
    const ev = cap.createEvent(eventName, eventData);

    if (ev) {
      if (target === 'document') {
        if (cordova && cordova.fireDocumentEvent) {
          cordova.fireDocumentEvent(eventName, eventData);
          return true;
        } else if (doc && doc.dispatchEvent) {
          return doc.dispatchEvent(ev);
        }
      } else if (target === 'window' && win.dispatchEvent) {
        return win.dispatchEvent(ev);
      } else if (doc && doc.querySelector) {
        const targetEl = doc.querySelector(target);
        if (targetEl) {
          return targetEl.dispatchEvent(ev);
        }
      }
    }
    return false;
  };
};

const initVendor = (win, cap) => {
  const Ionic = (win.Ionic = win.Ionic || {});
  const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
  const Plugins = cap.Plugins;

  IonicWebView.getServerBasePath = callback => {
    if (Plugins && Plugins.WebView && Plugins.WebView.getServerBasePath) {
      Plugins.WebView.getServerBasePath().then(result => {
        callback(result.path);
      });
    }
  };

  IonicWebView.setServerBasePath = path => {
    if (Plugins && Plugins.WebView && Plugins.WebView.setServerBasePath) {
      Plugins.WebView.setServerBasePath({ path });
    }
  };

  IonicWebView.persistServerBasePath = () => {
    if (Plugins && Plugins.WebView && Plugins.WebView.persistServerBasePath) {
      Plugins.WebView.persistServerBasePath();
    }
  };

  IonicWebView.convertFileSrc = url => cap.convertFileSrc(url);
};

const initLegacyHandlers = (win, cap) => {
  if (cap.isNativePlatform()) {
    // define cordova if it's not there already
    win.cordova = win.cordova || {};

    const doc = win.document;
    const nav = win.navigator;

    if (nav) {
      nav.app = nav.app || {};
      nav.app.exitApp = () => {
        cap.nativeCallback('App', 'exitApp', {});
      };
    }

    if (doc) {
      const docAddEventListener = doc.addEventListener;
      doc.addEventListener = (...args) => {
        const eventName = args[0];
        const handler = args[1];
        if (eventName === 'deviceready' && handler) {
          Promise.resolve().then(handler);
        } else if (eventName === 'backbutton' && cap.Plugins.App) {
          // Add a dummy listener so Capacitor doesn't do the default
          // back button action
          cap.Plugins.App.addListener('backButton', () => {
            // ignore
          });
        }
        return docAddEventListener.apply(doc, args);
      };
    }
  }

  // deprecated in v3, remove from v4
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();
};

const initBridge = (win, cap) => {
  // keep a collection of callbacks for native response data
  const callbacks = new Map();

  // Counter of callback ids, randomized to avoid
  // any issues during reloads if a call comes back with
  // an existing callback id from an old session
  let callbackIdCount = Math.floor(Math.random() * 134217728);

  let postToNative = null;

  // create the postToNative() fn if needed
  if (getPlatformId() === 'android') {
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
  } else if (getPlatformId() === 'ios') {
    // ios platform
    postToNative = data => {
      try {
        data.type = data.type ?? 'message';
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
};

// The meat and potatoes!
export const createCapacitor = win => {
  const cap = win.Capacitor || {};
  const Plugins = (cap.Plugins = cap.Plugins || {});

  const webviewServerUrl =
    typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';

  const getPlatform = () => getPlatformId(win);

  const isNativePlatform = () => getPlatformId(win) !== 'web';

  const isPluginAvailable = pluginName => {
    const plugin = registeredPlugins.get(pluginName);

    if (plugin && plugin.platforms && plugin.platforms.has(getPlatform())) {
      // JS implementation available for the current platform.
      return true;
    }

    if (getPluginHeader(pluginName)) {
      // Native implementation available.
      return true;
    }

    return false;
  };

  const getPluginHeader = pluginName => {
    if (cap.PluginHeaders && cap.PluginHeaders.find) {
      cap.PluginHeaders.find(h => h.name === pluginName);
    }

    return undefined;
  };

  const convertFileSrc = filePath =>
    convertFileSrcServerUrl(webviewServerUrl, filePath);

  const logJs = (msg, level) => {
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

  const handleError = err => win.console.error(err);

  const pluginMethodNoop = (_target, prop, pluginName) => {
    return Promise.reject(
      `${pluginName} does not have an implementation of "${prop}".`,
    );
  };

  const registeredPlugins = new Map();

  const registerPlugin = (pluginName, jsImplementations) => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      console.warn(
        `Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`,
      );

      return registeredPlugin.proxy;
    }

    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation;

    const loadPluginImplementation = async () => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation =
          typeof jsImplementations[platform] === 'function'
            ? (jsImplementation = await jsImplementations[platform]())
            : (jsImplementation = jsImplementations[platform]);
      }

      return jsImplementation;
    };

    const createPluginMethod = (impl, prop) => {
      if (impl) {
        if (impl && impl[prop]) {
          return impl[prop].bind(impl);
        }
      } else if (pluginHeader) {
        const methodHeader = pluginHeader.methods.find(m => prop === m.name);

        if (methodHeader) {
          if (methodHeader.rtype === 'promise') {
            return options =>
              cap.nativePromise(pluginName, prop.toString(), options);
          } else {
            return (options, callback) =>
              cap.nativeCallback(
                pluginName,
                prop.toString(),
                options,
                callback,
              );
          }
        }
      } else {
        throw new CapacitorException(
          `"${pluginName}" plugin is not implemented on ${platform}`,
          'UNIMPLEMENTED',
        );
      }
    };

    const createPluginMethodWrapper = prop => {
      let remove;
      const wrapper = (...args) => {
        const p = loadPluginImplementation().then(impl => {
          const fn = createPluginMethod(impl, prop);

          if (fn) {
            const p = fn(...args);
            if (p && p.remove) {
              remove = p.remove;
            }
            return p;
          } else {
            throw new CapacitorException(
              `"${pluginName}.${prop}()" is not implemented on ${platform}`,
              'UNIMPLEMENTED',
            );
          }
        });

        if (prop === 'addListener') {
          p.remove = async () => remove();
        }

        return p;
      };

      // Some flair ✨
      wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
      Object.defineProperty(wrapper, 'name', {
        value: prop,
        writable: false,
        configurable: false,
      });

      return wrapper;
    };

    const addListener = createPluginMethodWrapper('addListener');
    const removeListener = createPluginMethodWrapper('removeListener');
    const addListenerNative = (eventName, callback) => {
      const call = addListener({ eventName }, callback);
      const remove = async () => {
        const callbackId = await call;

        removeListener(
          {
            eventName,
            callbackId,
          },
          callback,
        );
      };

      const p = new Promise(resolve => call.then(() => resolve({ remove })));

      p.remove = async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      };

      return p;
    };

    const proxy = new Proxy(
      {},
      {
        get(_, prop) {
          switch (prop) {
            // https://github.com/facebook/react/issues/20030
            case '$$typeof':
              return undefined;
            case 'addListener':
              return isNativePlatform() ? addListenerNative : addListener;
            case 'removeListener':
              return removeListener;
            default:
              return createPluginMethodWrapper(prop);
          }
        },
      },
    );

    Plugins[pluginName] = proxy;

    registeredPlugins.set(pluginName, {
      name: pluginName,
      proxy,
      platforms: new Set([
        ...Object.keys(jsImplementations),
        ...(pluginHeader ? [platform] : []),
      ]),
    });

    return proxy;
  };

  cap.convertFileSrc = convertFileSrc;
  cap.getPlatform = getPlatform;
  cap.getServerUrl = () => webviewServerUrl;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.logJs = logJs;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;

  initBridge(win, cap);
  initEvents(win, cap);
  initVendor(win, cap);
  initLegacyHandlers(win, cap);

  return cap;
};

window.Capacitor = createCapacitor(
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : {},
);
