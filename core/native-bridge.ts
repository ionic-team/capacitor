/**
 * Note: When making changes to this file, run `npm run build:nativebridge`
 * afterwards to build the nativebridge.js files to the android and iOS projects.
 */
import type { HttpResponse } from './src/core-plugins';
import type {
  CallData,
  CapacitorInstance,
  ErrorCallData,
  MessageCallData,
  PluginResult,
  WindowCapacitor,
} from './src/definitions-internal';
import { CapacitorException } from './src/util';

// For removing exports for iOS/Android, keep let for reassignment
// eslint-disable-next-line
let dummy = {};

const initBridge = (w: any): void => {
  const getPlatformId = (win: WindowCapacitor): 'android' | 'ios' | 'web' => {
    if (win?.androidBridge) {
      return 'android';
    } else if (win?.webkit?.messageHandlers?.bridge) {
      return 'ios';
    } else {
      return 'web';
    }
  };

  const convertFileSrcServerUrl = (
    webviewServerUrl: string,
    filePath: string,
  ): string => {
    if (typeof filePath === 'string') {
      if (filePath.startsWith('/')) {
        return webviewServerUrl + '/_capacitor_file_' + filePath;
      } else if (filePath.startsWith('file://')) {
        return (
          webviewServerUrl + filePath.replace('file://', '/_capacitor_file_')
        );
      } else if (filePath.startsWith('content://')) {
        return (
          webviewServerUrl +
          filePath.replace('content:/', '/_capacitor_content_')
        );
      }
    }
    return filePath;
  };

  const initEvents = (win: WindowCapacitor, cap: CapacitorInstance) => {
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
          win?.console?.debug('Removing listener', pluginName, eventName);
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
      const doc = win.document;
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
      const doc = win.document;
      const cordova = win.cordova;
      eventData = eventData || {};
      const ev = cap.createEvent(eventName, eventData);

      if (ev) {
        if (target === 'document') {
          if (cordova?.fireDocumentEvent) {
            cordova.fireDocumentEvent(eventName, eventData);
            return true;
          } else if (doc?.dispatchEvent) {
            return doc.dispatchEvent(ev);
          }
        } else if (target === 'window' && win.dispatchEvent) {
          return win.dispatchEvent(ev);
        } else if (doc?.querySelector) {
          const targetEl = doc.querySelector(target);
          if (targetEl) {
            return targetEl.dispatchEvent(ev);
          }
        }
      }
      return false;
    };

    win.Capacitor = cap;
  };

  const initLegacyHandlers = (win: WindowCapacitor, cap: CapacitorInstance) => {
    // define cordova if it's not there already
    win.cordova = win.cordova || {};

    const doc = win.document;
    const nav = win.navigator;

    if (nav) {
      nav.app = nav.app || {};
      nav.app.exitApp = () => {
        if (!cap.Plugins?.App) {
          win.console.warn('App plugin not installed');
        } else {
          cap.nativeCallback('App', 'exitApp', {});
        }
      };
    }

    if (doc) {
      const docAddEventListener = doc.addEventListener;
      doc.addEventListener = (...args: any[]) => {
        const eventName = args[0];
        const handler = args[1];
        if (eventName === 'deviceready' && handler) {
          Promise.resolve().then(handler);
        } else if (eventName === 'backbutton' && cap.Plugins.App) {
          // Add a dummy listener so Capacitor doesn't do the default
          // back button action
          if (!cap.Plugins?.App) {
            win.console.warn('App plugin not installed');
          } else {
            cap.Plugins.App.addListener('backButton', () => {
              // ignore
            });
          }
        }
        return docAddEventListener.apply(doc, args);
      };
    }

    // deprecated in v3, remove from v4
    cap.platform = cap.getPlatform();
    cap.isNative = cap.isNativePlatform();

    win.Capacitor = cap;
  };

  const initVendor = (win: WindowCapacitor, cap: CapacitorInstance) => {
    const Ionic = (win.Ionic = win.Ionic || {});
    const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
    const Plugins = cap.Plugins;

    IonicWebView.getServerBasePath = (callback: (path: string) => void) => {
      Plugins?.WebView?.getServerBasePath().then((result: any) => {
        callback(result.path);
      });
    };

    IonicWebView.setServerBasePath = (path: any) => {
      Plugins?.WebView?.setServerBasePath({ path });
    };

    IonicWebView.persistServerBasePath = () => {
      Plugins?.WebView?.persistServerBasePath();
    };

    IonicWebView.convertFileSrc = (url: string) => cap.convertFileSrc(url);

    win.Capacitor = cap;
    win.Ionic.WebView = IonicWebView;
  };

  const initLogger = (win: WindowCapacitor, cap: CapacitorInstance) => {
    const BRIDGED_CONSOLE_METHODS: (keyof Console)[] = [
      'debug',
      'error',
      'info',
      'log',
      'trace',
      'warn',
    ];

    const createLogFromNative =
      (c: Partial<Console>) => (result: PluginResult) => {
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

    const createLogToNative =
      (c: Partial<Console>) => (call: MessageCallData) => {
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

    const isFullConsole = (c: Partial<Console>): c is Console => {
      if (!c) {
        return false;
      }

      return (
        typeof c.groupCollapsed === 'function' ||
        typeof c.groupEnd === 'function' ||
        typeof c.dir === 'function'
      );
    };

    const serializeConsoleMessage = (msg: any): string => {
      if (typeof msg === 'object') {
        try {
          msg = JSON.stringify(msg);
        } catch (e) {
          // ignore
        }
      }

      return String(msg);
    };

    const platform = getPlatformId(win);

    if (platform == 'android' || platform == 'ios') {
      // patch document.cookie on Android/iOS
      win.CapacitorCookiesDescriptor =
        Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
        Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');

      let doPatchCookies = false;

      // check if capacitor cookies is disabled before patching
      if (platform === 'ios') {
        // Use prompt to synchronously get capacitor cookies config.
        // https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323

        const payload = {
          type: 'CapacitorCookies.isEnabled',
        };

        const isCookiesEnabled = prompt(JSON.stringify(payload));
        if (isCookiesEnabled === 'true') {
          doPatchCookies = true;
        }
      } else if (typeof win.CapacitorCookiesAndroidInterface !== 'undefined') {
        const isCookiesEnabled =
          win.CapacitorCookiesAndroidInterface.isEnabled();
        if (isCookiesEnabled === true) {
          doPatchCookies = true;
        }
      }

      if (doPatchCookies) {
        Object.defineProperty(document, 'cookie', {
          get: function () {
            if (platform === 'ios') {
              // Use prompt to synchronously get cookies.
              // https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323

              const payload = {
                type: 'CapacitorCookies.get',
              };

              const res = prompt(JSON.stringify(payload));
              return res;
            } else if (
              typeof win.CapacitorCookiesAndroidInterface !== 'undefined'
            ) {
              return win.CapacitorCookiesAndroidInterface.getCookies();
            }
          },
          set: function (val) {
            const cookiePairs = val.split(';');
            const domainSection = val.toLowerCase().split('domain=')[1];
            const domain =
              cookiePairs.length > 1 &&
              domainSection != null &&
              domainSection.length > 0
                ? domainSection.split(';')[0].trim()
                : '';

            if (platform === 'ios') {
              // Use prompt to synchronously set cookies.
              // https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323

              const payload = {
                type: 'CapacitorCookies.set',
                action: val,
                domain,
              };

              prompt(JSON.stringify(payload));
            } else if (
              typeof win.CapacitorCookiesAndroidInterface !== 'undefined'
            ) {
              win.CapacitorCookiesAndroidInterface.setCookie(domain, val);
            }
          },
        });
      }

      // patch fetch / XHR on Android/iOS
      // store original fetch & XHR functions
      win.CapacitorWebFetch = window.fetch;
      win.CapacitorWebXMLHttpRequest = {
        abort: window.XMLHttpRequest.prototype.abort,
        getAllResponseHeaders:
          window.XMLHttpRequest.prototype.getAllResponseHeaders,
        getResponseHeader: window.XMLHttpRequest.prototype.getResponseHeader,
        open: window.XMLHttpRequest.prototype.open,
        send: window.XMLHttpRequest.prototype.send,
        setRequestHeader: window.XMLHttpRequest.prototype.setRequestHeader,
      };

      let doPatchHttp = false;

      // check if capacitor http is disabled before patching
      if (platform === 'ios') {
        // Use prompt to synchronously get capacitor http config.
        // https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323

        const payload = {
          type: 'CapacitorHttp',
        };

        const isHttpEnabled = prompt(JSON.stringify(payload));
        if (isHttpEnabled === 'true') {
          doPatchHttp = true;
        }
      } else if (typeof win.CapacitorHttpAndroidInterface !== 'undefined') {
        const isHttpEnabled = win.CapacitorHttpAndroidInterface.isEnabled();
        if (isHttpEnabled === true) {
          doPatchHttp = true;
        }
      }

      if (doPatchHttp) {
        // fetch patch
        window.fetch = async (
          resource: RequestInfo | URL,
          options?: RequestInit,
        ) => {
          if (
            !(
              resource.toString().startsWith('http:') ||
              resource.toString().startsWith('https:')
            )
          ) {
            return win.CapacitorWebFetch(resource, options);
          }

          const tag = `CapacitorHttp fetch ${Date.now()} ${resource}`;
          console.time(tag);
          try {
            // intercept request & pass to the bridge
            let headers = options?.headers;
            if (options?.headers instanceof Headers) {
              headers = Object.fromEntries((options.headers as any).entries());
            }
            const nativeResponse: HttpResponse = await cap.nativePromise(
              'CapacitorHttp',
              'request',
              {
                url: resource,
                method: options?.method ? options.method : undefined,
                data: options?.body ? options.body : undefined,
                headers: headers,
              },
            );

            let data = nativeResponse.headers['Content-Type']?.startsWith(
              'application/json',
            )
              ? JSON.stringify(nativeResponse.data)
              : nativeResponse.data;

            // use null data for 204 No Content HTTP response
            if (nativeResponse.status === 204) {
              data = null;
            }

            // intercept & parse response before returning
            const response = new Response(data, {
              headers: nativeResponse.headers,
              status: nativeResponse.status,
            });

            /*
             * copy url to response, `cordova-plugin-ionic` uses this url from the response
             * we need `Object.defineProperty` because url is an inherited getter on the Response
             * see: https://stackoverflow.com/a/57382543
             * */
            Object.defineProperty(response, 'url', {
              value: nativeResponse.url,
            });

            console.timeEnd(tag);
            return response;
          } catch (error) {
            console.timeEnd(tag);
            return Promise.reject(error);
          }
        };

        // XHR event listeners
        const addEventListeners = function () {
          this.addEventListener('abort', function () {
            if (typeof this.onabort === 'function') this.onabort();
          });

          this.addEventListener('error', function () {
            if (typeof this.onerror === 'function') this.onerror();
          });

          this.addEventListener('load', function () {
            if (typeof this.onload === 'function') this.onload();
          });

          this.addEventListener('loadend', function () {
            if (typeof this.onloadend === 'function') this.onloadend();
          });

          this.addEventListener('loadstart', function () {
            if (typeof this.onloadstart === 'function') this.onloadstart();
          });

          this.addEventListener('readystatechange', function () {
            if (typeof this.onreadystatechange === 'function')
              this.onreadystatechange();
          });

          this.addEventListener('timeout', function () {
            if (typeof this.ontimeout === 'function') this.ontimeout();
          });
        };

        // XHR patch abort
        window.XMLHttpRequest.prototype.abort = function () {
          if (
            this._url == null ||
            !(this._url.startsWith('http:') || this._url.startsWith('https:'))
          ) {
            return win.CapacitorWebXMLHttpRequest.abort.call(this);
          }
          this.readyState = 0;
          this.dispatchEvent(new Event('abort'));
          this.dispatchEvent(new Event('loadend'));
        };

        // XHR patch open
        window.XMLHttpRequest.prototype.open = function (
          method: string,
          url: string,
        ) {
          this._url = url;

          if (
            !(url.startsWith('http:') || url.toString().startsWith('https:'))
          ) {
            return win.CapacitorWebXMLHttpRequest.open.call(this, method, url);
          }

          Object.defineProperties(this, {
            _headers: {
              value: {},
              writable: true,
            },
            _method: {
              value: method,
              writable: true,
            },
            readyState: {
              get: function () {
                return this._readyState ?? 0;
              },
              set: function (val: number) {
                this._readyState = val;
                this.dispatchEvent(new Event('readystatechange'));
              },
            },
            response: {
              value: '',
              writable: true,
            },
            responseText: {
              value: '',
              writable: true,
            },
            responseURL: {
              value: '',
              writable: true,
            },
            status: {
              value: 0,
              writable: true,
            },
          });

          addEventListeners.call(this);
          this.readyState = 1;
        };

        // XHR patch set request header
        window.XMLHttpRequest.prototype.setRequestHeader = function (
          header: string,
          value: string,
        ) {
          if (
            this._url == null ||
            !(this._url.startsWith('http:') || this._url.startsWith('https:'))
          ) {
            return win.CapacitorWebXMLHttpRequest.setRequestHeader.call(
              this,
              header,
              value,
            );
          }
          this._headers[header] = value;
        };

        // XHR patch send
        window.XMLHttpRequest.prototype.send = function (
          body?: Document | XMLHttpRequestBodyInit,
        ) {
          if (
            this._url == null ||
            !(this._url.startsWith('http:') || this._url.startsWith('https:'))
          ) {
            return win.CapacitorWebXMLHttpRequest.send.call(this, body);
          }

          const tag = `CapacitorHttp XMLHttpRequest ${Date.now()} ${this._url}`;
          console.time(tag);

          try {
            this.readyState = 2;

            // intercept request & pass to the bridge
            cap
              .nativePromise('CapacitorHttp', 'request', {
                url: this._url,
                method: this._method,
                data: body !== null ? body : undefined,
                headers:
                  this._headers != null && Object.keys(this._headers).length > 0
                    ? this._headers
                    : undefined,
              })
              .then((nativeResponse: any) => {
                // intercept & parse response before returning
                if (this.readyState == 2) {
                  this.dispatchEvent(new Event('loadstart'));
                  this._headers = nativeResponse.headers;
                  this.status = nativeResponse.status;
                  this.response = nativeResponse.data;
                  this.responseText = nativeResponse.headers[
                    'Content-Type'
                  ]?.startsWith('application/json')
                    ? JSON.stringify(nativeResponse.data)
                    : nativeResponse.data;
                  this.responseURL = nativeResponse.url;
                  this.readyState = 4;
                  this.dispatchEvent(new Event('load'));
                  this.dispatchEvent(new Event('loadend'));
                }
                console.timeEnd(tag);
              })
              .catch((error: any) => {
                this.dispatchEvent(new Event('loadstart'));
                this.status = error.status;
                this._headers = error.headers;
                this.response = error.data;
                this.responseText = JSON.stringify(error.data);
                this.responseURL = error.url;
                this.readyState = 4;
                this.dispatchEvent(new Event('error'));
                this.dispatchEvent(new Event('loadend'));
                console.timeEnd(tag);
              });
          } catch (error) {
            this.dispatchEvent(new Event('loadstart'));
            this.status = 500;
            this._headers = {};
            this.response = error;
            this.responseText = error.toString();
            this.responseURL = this._url;
            this.readyState = 4;
            this.dispatchEvent(new Event('error'));
            this.dispatchEvent(new Event('loadend'));
            console.timeEnd(tag);
          }
        };

        // XHR patch getAllResponseHeaders
        window.XMLHttpRequest.prototype.getAllResponseHeaders = function () {
          if (
            this._url == null ||
            !(this._url.startsWith('http:') || this._url.startsWith('https:'))
          ) {
            return win.CapacitorWebXMLHttpRequest.getAllResponseHeaders.call(
              this,
            );
          }

          let returnString = '';
          for (const key in this._headers) {
            if (key != 'Set-Cookie') {
              returnString += key + ': ' + this._headers[key] + '\r\n';
            }
          }
          return returnString;
        };

        // XHR patch getResponseHeader
        window.XMLHttpRequest.prototype.getResponseHeader = function (name) {
          if (
            this._url == null ||
            !(this._url.startsWith('http:') || this._url.startsWith('https:'))
          ) {
            return win.CapacitorWebXMLHttpRequest.getResponseHeader.call(
              this,
              name,
            );
          }
          return this._headers[name];
        };
      }
    }

    // patch window.console on iOS and store original console fns
    const isIos = getPlatformId(win) === 'ios';
    if (win.console && isIos) {
      Object.defineProperties(
        win.console,
        BRIDGED_CONSOLE_METHODS.reduce((props: any, method) => {
          const consoleMethod = win.console[method].bind(win.console);
          props[method] = {
            value: (...args: any[]) => {
              const msgs = [...args];
              cap.toNative('Console', 'log', {
                level: method,
                message: msgs.map(serializeConsoleMessage).join(' '),
              });
              return consoleMethod(...args);
            },
          };
          return props;
        }, {}),
      );
    }

    cap.logJs = (msg, level) => {
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

    cap.logToNative = createLogToNative(win.console);
    cap.logFromNative = createLogFromNative(win.console);

    cap.handleError = err => win.console.error(err);

    win.Capacitor = cap;
  };

  function initNativeBridge(win: WindowCapacitor) {
    const cap = win.Capacitor || ({} as CapacitorInstance);

    // keep a collection of callbacks for native response data
    const callbacks = new Map();

    const webviewServerUrl =
      typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';
    cap.getServerUrl = () => webviewServerUrl;
    cap.convertFileSrc = filePath =>
      convertFileSrcServerUrl(webviewServerUrl, filePath);

    // Counter of callback ids, randomized to avoid
    // any issues during reloads if a call comes back with
    // an existing callback id from an old session
    let callbackIdCount = Math.floor(Math.random() * 134217728);

    let postToNative: (data: CallData) => void | null = null;

    const isNativePlatform = () => true;
    const getPlatform = () => getPlatformId(win);

    cap.getPlatform = getPlatform;
    cap.isPluginAvailable = name =>
      Object.prototype.hasOwnProperty.call(cap.Plugins, name);
    cap.isNativePlatform = isNativePlatform;

    // create the postToNative() fn if needed
    if (getPlatformId(win) === 'android') {
      // android platform
      postToNative = data => {
        try {
          win.androidBridge.postMessage(JSON.stringify(data));
        } catch (e) {
          win?.console?.error(e);
        }
      };
    } else if (getPlatformId(win) === 'ios') {
      // ios platform
      postToNative = data => {
        try {
          data.type = data.type ? data.type : 'message';
          win.webkit.messageHandlers.bridge.postMessage(data);
        } catch (e) {
          win?.console?.error(e);
        }
      };
    }

    cap.handleWindowError = (msg, url, lineNo, columnNo, err) => {
      const str = (msg as string).toLowerCase();

      if (str.indexOf('script error') > -1) {
        // Some IE issue?
      } else {
        const errObj: ErrorCallData = {
          type: 'js.error',
          error: {
            message: msg as string,
            url: url,
            line: lineNo,
            col: columnNo,
            errorObject: JSON.stringify(err),
          },
        };

        if (err !== null) {
          cap.handleError(err);
        }

        postToNative(errObj);
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

          if (cap.isLoggingEnabled && pluginName !== 'Console') {
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

    if (win?.androidBridge) {
      win.androidBridge.onmessage = function (event) {
        returnResult(JSON.parse(event.data));
      };
    }

    /**
     * Process a response from the native layer.
     */
    cap.fromNative = result => {
      returnResult(result);
    };

    const returnResult = (result: any) => {
      if (cap.isLoggingEnabled && result.pluginId !== 'Console') {
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
              // use any type to avoid importing util and compiling most of .ts files
              (err as any)[key] = (result as any).error[key];
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

    cap.nativeCallback = (pluginName, methodName, options, callback) => {
      if (typeof options === 'function') {
        console.warn(
          `Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated.`,
        );

        callback = options as any;
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

    cap.withPlugin = (_pluginId, _fn) => dummy;

    cap.Exception = CapacitorException;

    initEvents(win, cap);
    initLegacyHandlers(win, cap);
    initVendor(win, cap);

    win.Capacitor = cap;
  }

  initNativeBridge(w);
};

initBridge(
  typeof globalThis !== 'undefined'
    ? (globalThis as WindowCapacitor)
    : typeof self !== 'undefined'
    ? (self as WindowCapacitor)
    : typeof window !== 'undefined'
    ? (window as WindowCapacitor)
    : typeof global !== 'undefined'
    ? (global as WindowCapacitor)
    : ({} as WindowCapacitor),
);

// Export only for tests
export { initBridge };
