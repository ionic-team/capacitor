
/*! Capacitor: https://capacitorjs.com/ - MIT License */
/* Generated File. Do not edit. */

var nativeBridge = (function (exports) {
    'use strict';

    var ExceptionCode;
    (function (ExceptionCode) {
        /**
         * API is not implemented.
         *
         * This usually means the API can't be used because it is not implemented for
         * the current platform.
         */
        ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
        /**
         * API is not available.
         *
         * This means the API can't be used right now because:
         *   - it is currently missing a prerequisite, such as network connectivity
         *   - it requires a particular platform or browser version
         */
        ExceptionCode["Unavailable"] = "UNAVAILABLE";
    })(ExceptionCode || (ExceptionCode = {}));
    class CapacitorException extends Error {
        constructor(message, code, data) {
            super(message);
            this.message = message;
            this.code = code;
            this.data = data;
        }
    }
    const getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
            return 'android';
        }
        else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
            return 'ios';
        }
        else {
            return 'web';
        }
    };

    const createCapacitor = (win) => {
        var _a, _b, _c, _d, _e;
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = (cap.Plugins = cap.Plugins || {});
        /**
         * @deprecated Use `capCustomPlatform` instead, default functions like registerPlugin will function with the new object.
         */
        const capPlatforms = win.CapacitorPlatforms;
        const defaultGetPlatform = () => {
            return capCustomPlatform !== null
                ? capCustomPlatform.name
                : getPlatformId(win);
        };
        const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
        const defaultIsNativePlatform = () => getPlatform() !== 'web';
        const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
        const defaultIsPluginAvailable = (pluginName) => {
            const plugin = registeredPlugins.get(pluginName);
            if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
                // JS implementation available for the current platform.
                return true;
            }
            if (getPluginHeader(pluginName)) {
                // Native implementation available.
                return true;
            }
            return false;
        };
        const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) ||
            defaultIsPluginAvailable;
        const defaultGetPluginHeader = (pluginName) => { var _a; return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find(h => h.name === pluginName); };
        const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
        const handleError = (err) => win.console.error(err);
        const pluginMethodNoop = (_target, prop, pluginName) => {
            return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
        };
        const registeredPlugins = new Map();
        const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
            const registeredPlugin = registeredPlugins.get(pluginName);
            if (registeredPlugin) {
                console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
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
                else if (capCustomPlatform !== null &&
                    !jsImplementation &&
                    'web' in jsImplementations) {
                    jsImplementation =
                        typeof jsImplementations['web'] === 'function'
                            ? (jsImplementation = await jsImplementations['web']())
                            : (jsImplementation = jsImplementations['web']);
                }
                return jsImplementation;
            };
            const createPluginMethod = (impl, prop) => {
                var _a, _b;
                if (pluginHeader) {
                    const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find(m => prop === m.name);
                    if (methodHeader) {
                        if (methodHeader.rtype === 'promise') {
                            return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                        }
                        else {
                            return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                        }
                    }
                    else if (impl) {
                        return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
                    }
                }
                else if (impl) {
                    return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
                }
                else {
                    throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
            };
            const createPluginMethodWrapper = (prop) => {
                let remove;
                const wrapper = (...args) => {
                    const p = loadPluginImplementation().then(impl => {
                        const fn = createPluginMethod(impl, prop);
                        if (fn) {
                            const p = fn(...args);
                            remove = p === null || p === void 0 ? void 0 : p.remove;
                            return p;
                        }
                        else {
                            throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
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
                    removeListener({
                        eventName,
                        callbackId,
                    }, callback);
                };
                const p = new Promise(resolve => call.then(() => resolve({ remove })));
                p.remove = async () => {
                    console.warn(`Using addListener() without 'await' is deprecated.`);
                    await remove();
                };
                return p;
            };
            const proxy = new Proxy({}, {
                get(_, prop) {
                    switch (prop) {
                        // https://github.com/facebook/react/issues/20030
                        case '$$typeof':
                            return undefined;
                        case 'toJSON':
                            return () => ({});
                        case 'addListener':
                            return pluginHeader ? addListenerNative : addListener;
                        case 'removeListener':
                            return removeListener;
                        default:
                            return createPluginMethodWrapper(prop);
                    }
                },
            });
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
        const registerPlugin = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
        // Add in convertFileSrc for web, it will already be available in native context
        if (!cap.convertFileSrc) {
            cap.convertFileSrc = filePath => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.pluginMethodNoop = pluginMethodNoop;
        cap.registerPlugin = registerPlugin;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        // Deprecated props
        cap.platform = cap.getPlatform();
        cap.isNative = cap.isNativePlatform();
        return cap;
    };
    const initCapacitorGlobal = (win) => (win.Capacitor = createCapacitor(win));

    const Capacitor = /*#__PURE__*/ initCapacitorGlobal(typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
                ? window
                : typeof global !== 'undefined'
                    ? global
                    : {});
    const registerPlugin = Capacitor.registerPlugin;
    /**
     * @deprecated Provided for backwards compatibility for Capacitor v2 plugins.
     * Capacitor v3 plugins should import the plugin directly. This "Plugins"
     * export is deprecated in v3, and will be removed in v4.
     */
    Capacitor.Plugins;

    /**
     * Base class web plugins should extend.
     */
    class WebPlugin {
        constructor(config) {
            this.listeners = {};
            this.windowListeners = {};
            if (config) {
                // TODO: add link to upgrade guide
                console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
                this.config = config;
            }
        }
        addListener(eventName, listenerFunc) {
            const listeners = this.listeners[eventName];
            if (!listeners) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(listenerFunc);
            // If we haven't added a window listener for this event and it requires one,
            // go ahead and add it
            const windowListener = this.windowListeners[eventName];
            if (windowListener && !windowListener.registered) {
                this.addWindowListener(windowListener);
            }
            const remove = async () => this.removeListener(eventName, listenerFunc);
            const p = Promise.resolve({ remove });
            Object.defineProperty(p, 'remove', {
                value: async () => {
                    console.warn(`Using addListener() without 'await' is deprecated.`);
                    await remove();
                },
            });
            return p;
        }
        async removeAllListeners() {
            this.listeners = {};
            for (const listener in this.windowListeners) {
                this.removeWindowListener(this.windowListeners[listener]);
            }
            this.windowListeners = {};
        }
        notifyListeners(eventName, data) {
            const listeners = this.listeners[eventName];
            if (listeners) {
                listeners.forEach(listener => listener(data));
            }
        }
        hasListeners(eventName) {
            return !!this.listeners[eventName].length;
        }
        registerWindowListener(windowEventName, pluginEventName) {
            this.windowListeners[pluginEventName] = {
                registered: false,
                windowEventName,
                pluginEventName,
                handler: event => {
                    this.notifyListeners(pluginEventName, event);
                },
            };
        }
        unimplemented(msg = 'not implemented') {
            return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = 'not available') {
            return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
            const listeners = this.listeners[eventName];
            if (!listeners) {
                return;
            }
            const index = listeners.indexOf(listenerFunc);
            this.listeners[eventName].splice(index, 1);
            // If there are no more listeners for this type of event,
            // remove the window listener
            if (!this.listeners[eventName].length) {
                this.removeWindowListener(this.windowListeners[eventName]);
            }
        }
        addWindowListener(handle) {
            window.addEventListener(handle.windowEventName, handle.handler);
            handle.registered = true;
        }
        removeWindowListener(handle) {
            if (!handle) {
                return;
            }
            window.removeEventListener(handle.windowEventName, handle.handler);
            handle.registered = false;
        }
    }

    /******** END WEB VIEW PLUGIN ********/
    /******** COOKIES PLUGIN ********/
    /**
     * Safely web encode a string value (inspired by js-cookie)
     * @param str The string value to encode
     */
    const encode = (str) => encodeURIComponent(str)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);
    /**
     * Safely web decode a string value (inspired by js-cookie)
     * @param str The string value to decode
     */
    const decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    class CapacitorCookiesPluginWeb extends WebPlugin {
        async getCookies() {
            const cookies = document.cookie;
            const cookieMap = {};
            cookies.split(';').forEach(cookie => {
                if (cookie.length <= 0)
                    return;
                // Replace first "=" with CAP_COOKIE to prevent splitting on additional "="
                let [key, value] = cookie.replace(/=/, 'CAP_COOKIE').split('CAP_COOKIE');
                key = decode(key).trim();
                value = decode(value).trim();
                cookieMap[key] = value;
            });
            return cookieMap;
        }
        async setCookie(options) {
            try {
                // Safely Encoded Key/Value
                const encodedKey = encode(options.key);
                const encodedValue = encode(options.value);
                // Clean & sanitize options
                const expires = `; expires=${(options.expires || '').replace('expires=', '')}`; // Default is "; expires="
                const path = (options.path || '/').replace('path=', ''); // Default is "path=/"
                const domain = options.url != null && options.url.length > 0
                    ? `domain=${options.url}`
                    : '';
                document.cookie = `${encodedKey}=${encodedValue || ''}${expires}; path=${path}; ${domain};`;
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        async deleteCookie(options) {
            try {
                document.cookie = `${options.key}=; Max-Age=0`;
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        async clearCookies() {
            try {
                const cookies = document.cookie.split(';') || [];
                for (const cookie of cookies) {
                    document.cookie = cookie
                        .replace(/^ +/, '')
                        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        async clearAllCookies() {
            try {
                await this.clearCookies();
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
    }
    registerPlugin('CapacitorCookies', {
        web: () => new CapacitorCookiesPluginWeb(),
    });
    // UTILITY FUNCTIONS
    /**
     * Read in a Blob value and return it as a base64 string
     * @param blob The blob value to convert to a base64 string
     */
    const readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result;
            // remove prefix "data:application/pdf;base64,"
            resolve(base64String.indexOf(',') >= 0
                ? base64String.split(',')[1]
                : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
    /**
     * Normalize an HttpHeaders map by lowercasing all of the values
     * @param headers The HttpHeaders object to normalize
     */
    const normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
            acc[key] = headers[originalKeys[index]];
            return acc;
        }, {});
        return normalized;
    };
    /**
     * Builds a string of url parameters that
     * @param params A map of url parameters
     * @param shouldEncode true if you should encodeURIComponent() the values (true by default)
     */
    const buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
            return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
            const [key, value] = entry;
            let encodedValue;
            let item;
            if (Array.isArray(value)) {
                item = '';
                value.forEach(str => {
                    encodedValue = shouldEncode ? encodeURIComponent(str) : str;
                    item += `${key}=${encodedValue}&`;
                });
                // last character will always be "&" so slice it off
                item.slice(0, -1);
            }
            else {
                encodedValue = shouldEncode ? encodeURIComponent(value) : value;
                item = `${key}=${encodedValue}`;
            }
            return `${accumulator}&${item}`;
        }, '');
        // Remove initial "&" from the reduce
        return output.substr(1);
    };
    /**
     * Build the RequestInit object based on the options passed into the initial request
     * @param options The Http plugin options
     * @param extra Any extra RequestInit values
     */
    const buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || 'GET', headers: options.headers }, extra);
        // Get the content-type
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers['content-type'] || '';
        // If body is already a string, then pass it through as-is.
        if (typeof options.data === 'string') {
            output.body = options.data;
        }
        // Build request initializers based off of content-type
        else if (type.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(options.data || {})) {
                params.set(key, value);
            }
            output.body = params.toString();
        }
        else if (type.includes('multipart/form-data')) {
            const form = new FormData();
            if (options.data instanceof FormData) {
                options.data.forEach((value, key) => {
                    form.append(key, value);
                });
            }
            else {
                for (const key of Object.keys(options.data)) {
                    form.append(key, options.data[key]);
                }
            }
            output.body = form;
            const headers = new Headers(output.headers);
            headers.delete('content-type'); // content-type will be set by `window.fetch` to includy boundary
            output.headers = headers;
        }
        else if (type.includes('application/json') ||
            typeof options.data === 'object') {
            output.body = JSON.stringify(options.data);
        }
        return output;
    };
    const CAPACITOR_HTTP_INTERCEPTOR = '/_capacitor_http_interceptor_';
    const CAPACITOR_HTTPS_INTERCEPTOR = '/_capacitor_https_interceptor_';
    const isRelativeOrProxyUrl = (url) => !url ||
        !(url.startsWith('http:') || url.startsWith('https:')) ||
        url.indexOf(CAPACITOR_HTTP_INTERCEPTOR) > -1 ||
        url.indexOf(CAPACITOR_HTTPS_INTERCEPTOR) > -1;
    const createProxyUrl = (url, win) => {
        var _a, _b, _c;
        if (isRelativeOrProxyUrl(url))
            return url;
        const proxyUrl = new URL(url);
        const isHttps = proxyUrl.protocol === 'https:';
        if ((_b = (_a = win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
            proxyUrl.protocol = (_c = win.WEBVIEW_SERVER_URL) !== null && _c !== void 0 ? _c : 'capacitor:';
        }
        proxyUrl.pathname =
            (isHttps ? CAPACITOR_HTTPS_INTERCEPTOR : CAPACITOR_HTTP_INTERCEPTOR) +
                proxyUrl.pathname;
        return proxyUrl.toString();
    };
    // WEB IMPLEMENTATION
    class CapacitorHttpPluginWeb extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
            const requestInit = buildRequestInit(options, options.webFetchExtra);
            const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
            const url = urlParams ? `${options.url}?${urlParams}` : options.url;
            const response = await fetch(url, requestInit);
            const contentType = response.headers.get('content-type') || '';
            // Default to 'text' responseType so no parsing happens
            let { responseType = 'text' } = response.ok ? options : {};
            // If the response content-type is json, force the response to be json
            if (contentType.includes('application/json')) {
                responseType = 'json';
            }
            let data;
            let blob;
            switch (responseType) {
                case 'arraybuffer':
                case 'blob':
                    blob = await response.blob();
                    data = await readBlobAsBase64(blob);
                    break;
                case 'json':
                    data = await response.json();
                    break;
                case 'document':
                case 'text':
                default:
                    data = await response.text();
            }
            // Convert fetch headers to Capacitor HttpHeaders
            const headers = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });
            return {
                data,
                headers,
                status: response.status,
                url: response.url,
            };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'GET' }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'POST' }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'PUT' }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'PATCH' }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
            return this.request(Object.assign(Object.assign({}, options), { method: 'DELETE' }));
        }
    }
    registerPlugin('CapacitorHttp', {
        web: () => new CapacitorHttpPluginWeb(),
    });
    /******** END HTTP PLUGIN ********/

    /**
     * Note: When making changes to this file, run `npm run build:nativebridge`
     * afterwards to build the nativebridge.js files to the android and iOS projects.
     */
    // For removing exports for iOS/Android, keep let for reassignment
    // eslint-disable-next-line
    let dummy = {};
    const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const data = reader.result;
            resolve(btoa(data));
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
    const convertFormData = async (formData) => {
        const newFormData = [];
        for (const pair of formData.entries()) {
            const [key, value] = pair;
            if (value instanceof File) {
                const base64File = await readFileAsBase64(value);
                newFormData.push({
                    key,
                    value: base64File,
                    type: 'base64File',
                    contentType: value.type,
                    fileName: value.name,
                });
            }
            else {
                newFormData.push({ key, value, type: 'string' });
            }
        }
        return newFormData;
    };
    const convertBody = async (body) => {
        if (body instanceof FormData) {
            const formData = await convertFormData(body);
            const boundary = `${Date.now()}`;
            return {
                data: formData,
                type: 'formData',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=--${boundary}`,
                },
            };
        }
        else if (body instanceof File) {
            const fileData = await readFileAsBase64(body);
            return {
                data: fileData,
                type: 'file',
                headers: { 'Content-Type': body.type },
            };
        }
        return { data: body, type: 'json' };
    };
    const initBridge = (w) => {
        const getPlatformId = (win) => {
            var _a, _b;
            if (win === null || win === void 0 ? void 0 : win.androidBridge) {
                return 'android';
            }
            else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
                return 'ios';
            }
            else {
                return 'web';
            }
        };
        const convertFileSrcServerUrl = (webviewServerUrl, filePath) => {
            if (typeof filePath === 'string') {
                if (filePath.startsWith('/')) {
                    return webviewServerUrl + '/_capacitor_file_' + filePath;
                }
                else if (filePath.startsWith('file://')) {
                    return (webviewServerUrl + filePath.replace('file://', '/_capacitor_file_'));
                }
                else if (filePath.startsWith('content://')) {
                    return (webviewServerUrl +
                        filePath.replace('content:/', '/_capacitor_content_'));
                }
            }
            return filePath;
        };
        const initEvents = (win, cap) => {
            cap.addListener = (pluginName, eventName, callback) => {
                const callbackId = cap.nativeCallback(pluginName, 'addListener', {
                    eventName: eventName,
                }, callback);
                return {
                    remove: async () => {
                        var _a;
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.debug('Removing listener', pluginName, eventName);
                        cap.removeListener(pluginName, callbackId, eventName, callback);
                    },
                };
            };
            cap.removeListener = (pluginName, callbackId, eventName, callback) => {
                cap.nativeCallback(pluginName, 'removeListener', {
                    callbackId: callbackId,
                    eventName: eventName,
                }, callback);
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
                        if (cordova === null || cordova === void 0 ? void 0 : cordova.fireDocumentEvent) {
                            cordova.fireDocumentEvent(eventName, eventData);
                            return true;
                        }
                        else if (doc === null || doc === void 0 ? void 0 : doc.dispatchEvent) {
                            return doc.dispatchEvent(ev);
                        }
                    }
                    else if (target === 'window' && win.dispatchEvent) {
                        return win.dispatchEvent(ev);
                    }
                    else if (doc === null || doc === void 0 ? void 0 : doc.querySelector) {
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
        const initLegacyHandlers = (win, cap) => {
            // define cordova if it's not there already
            win.cordova = win.cordova || {};
            const doc = win.document;
            const nav = win.navigator;
            if (nav) {
                nav.app = nav.app || {};
                nav.app.exitApp = () => {
                    var _a;
                    if (!((_a = cap.Plugins) === null || _a === void 0 ? void 0 : _a.App)) {
                        win.console.warn('App plugin not installed');
                    }
                    else {
                        cap.nativeCallback('App', 'exitApp', {});
                    }
                };
            }
            if (doc) {
                const docAddEventListener = doc.addEventListener;
                doc.addEventListener = (...args) => {
                    var _a;
                    const eventName = args[0];
                    const handler = args[1];
                    if (eventName === 'deviceready' && handler) {
                        Promise.resolve().then(handler);
                    }
                    else if (eventName === 'backbutton' && cap.Plugins.App) {
                        // Add a dummy listener so Capacitor doesn't do the default
                        // back button action
                        if (!((_a = cap.Plugins) === null || _a === void 0 ? void 0 : _a.App)) {
                            win.console.warn('App plugin not installed');
                        }
                        else {
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
        const initVendor = (win, cap) => {
            const Ionic = (win.Ionic = win.Ionic || {});
            const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
            const Plugins = cap.Plugins;
            IonicWebView.getServerBasePath = (callback) => {
                var _a;
                (_a = Plugins === null || Plugins === void 0 ? void 0 : Plugins.WebView) === null || _a === void 0 ? void 0 : _a.getServerBasePath().then((result) => {
                    callback(result.path);
                });
            };
            IonicWebView.setServerBasePath = (path) => {
                var _a;
                (_a = Plugins === null || Plugins === void 0 ? void 0 : Plugins.WebView) === null || _a === void 0 ? void 0 : _a.setServerBasePath({ path });
            };
            IonicWebView.persistServerBasePath = () => {
                var _a;
                (_a = Plugins === null || Plugins === void 0 ? void 0 : Plugins.WebView) === null || _a === void 0 ? void 0 : _a.persistServerBasePath();
            };
            IonicWebView.convertFileSrc = (url) => cap.convertFileSrc(url);
            win.Capacitor = cap;
            win.Ionic.WebView = IonicWebView;
        };
        const initLogger = (win, cap) => {
            const BRIDGED_CONSOLE_METHODS = [
                'debug',
                'error',
                'info',
                'log',
                'trace',
                'warn',
            ];
            const createLogFromNative = (c) => (result) => {
                if (isFullConsole(c)) {
                    const success = result.success === true;
                    const tagStyles = success
                        ? 'font-style: italic; font-weight: lighter; color: gray'
                        : 'font-style: italic; font-weight: lighter; color: red';
                    c.groupCollapsed('%cresult %c' +
                        result.pluginId +
                        '.' +
                        result.methodName +
                        ' (#' +
                        result.callbackId +
                        ')', tagStyles, 'font-style: italic; font-weight: bold; color: #444');
                    if (result.success === false) {
                        c.error(result.error);
                    }
                    else {
                        c.dir(result.data);
                    }
                    c.groupEnd();
                }
                else {
                    if (result.success === false) {
                        c.error('LOG FROM NATIVE', result.error);
                    }
                    else {
                        c.log('LOG FROM NATIVE', result.data);
                    }
                }
            };
            const createLogToNative = (c) => (call) => {
                if (isFullConsole(c)) {
                    c.groupCollapsed('%cnative %c' +
                        call.pluginId +
                        '.' +
                        call.methodName +
                        ' (#' +
                        call.callbackId +
                        ')', 'font-weight: lighter; color: gray', 'font-weight: bold; color: #000');
                    c.dir(call);
                    c.groupEnd();
                }
                else {
                    c.log('LOG TO NATIVE: ', call);
                }
            };
            const isFullConsole = (c) => {
                if (!c) {
                    return false;
                }
                return (typeof c.groupCollapsed === 'function' ||
                    typeof c.groupEnd === 'function' ||
                    typeof c.dir === 'function');
            };
            const serializeConsoleMessage = (msg) => {
                if (typeof msg === 'object') {
                    try {
                        msg = JSON.stringify(msg);
                    }
                    catch (e) {
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
                }
                else if (typeof win.CapacitorCookiesAndroidInterface !== 'undefined') {
                    const isCookiesEnabled = win.CapacitorCookiesAndroidInterface.isEnabled();
                    if (isCookiesEnabled === true) {
                        doPatchCookies = true;
                    }
                }
                if (doPatchCookies) {
                    Object.defineProperty(document, 'cookie', {
                        get: function () {
                            var _a, _b, _c;
                            if (platform === 'ios') {
                                // Use prompt to synchronously get cookies.
                                // https://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code/49474323#49474323
                                const payload = {
                                    type: 'CapacitorCookies.get',
                                };
                                const res = prompt(JSON.stringify(payload));
                                return res;
                            }
                            else if (typeof win.CapacitorCookiesAndroidInterface !== 'undefined') {
                                // return original document.cookie since Android does not support filtering of `httpOnly` cookies
                                return (_c = (_b = (_a = win.CapacitorCookiesDescriptor) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(document)) !== null && _c !== void 0 ? _c : '';
                            }
                        },
                        set: function (val) {
                            const cookiePairs = val.split(';');
                            const domainSection = val.toLowerCase().split('domain=')[1];
                            const domain = cookiePairs.length > 1 &&
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
                            }
                            else if (typeof win.CapacitorCookiesAndroidInterface !== 'undefined') {
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
                    constructor: window.XMLHttpRequest.prototype.constructor,
                    getAllResponseHeaders: window.XMLHttpRequest.prototype.getAllResponseHeaders,
                    getResponseHeader: window.XMLHttpRequest.prototype.getResponseHeader,
                    open: window.XMLHttpRequest.prototype.open,
                    prototype: window.XMLHttpRequest.prototype,
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
                }
                else if (typeof win.CapacitorHttpAndroidInterface !== 'undefined') {
                    const isHttpEnabled = win.CapacitorHttpAndroidInterface.isEnabled();
                    if (isHttpEnabled === true) {
                        doPatchHttp = true;
                    }
                }
                if (doPatchHttp) {
                    // fetch patch
                    window.fetch = async (resource, options) => {
                        if (!(resource.toString().startsWith('http:') ||
                            resource.toString().startsWith('https:'))) {
                            return win.CapacitorWebFetch(resource, options);
                        }
                        if (!(options === null || options === void 0 ? void 0 : options.method) ||
                            options.method.toLocaleUpperCase() === 'GET' ||
                            options.method.toLocaleUpperCase() === 'HEAD' ||
                            options.method.toLocaleUpperCase() === 'OPTIONS' ||
                            options.method.toLocaleUpperCase() === 'TRACE') {
                            const modifiedResource = createProxyUrl(resource.toString(), win);
                            const response = await win.CapacitorWebFetch(modifiedResource, options);
                            return response;
                        }
                        const tag = `CapacitorHttp fetch ${Date.now()} ${resource}`;
                        console.time(tag);
                        try {
                            // intercept request & pass to the bridge
                            const { data: requestData, type, headers, } = await convertBody((options === null || options === void 0 ? void 0 : options.body) || undefined);
                            let optionHeaders = options === null || options === void 0 ? void 0 : options.headers;
                            if ((options === null || options === void 0 ? void 0 : options.headers) instanceof Headers) {
                                optionHeaders = Object.fromEntries(options.headers.entries());
                            }
                            const nativeResponse = await cap.nativePromise('CapacitorHttp', 'request', {
                                url: resource,
                                method: (options === null || options === void 0 ? void 0 : options.method) ? options.method : undefined,
                                data: requestData,
                                dataType: type,
                                headers: Object.assign(Object.assign({}, headers), optionHeaders),
                            });
                            const contentType = nativeResponse.headers['Content-Type'] ||
                                nativeResponse.headers['content-type'];
                            let data = (contentType === null || contentType === void 0 ? void 0 : contentType.startsWith('application/json'))
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
                        }
                        catch (error) {
                            console.timeEnd(tag);
                            return Promise.reject(error);
                        }
                    };
                    window.XMLHttpRequest = function () {
                        const xhr = new win.CapacitorWebXMLHttpRequest.constructor();
                        Object.defineProperties(xhr, {
                            _headers: {
                                value: {},
                                writable: true,
                            },
                            _method: {
                                value: xhr.method,
                                writable: true,
                            },
                            readyState: {
                                get: function () {
                                    var _a;
                                    return (_a = this._readyState) !== null && _a !== void 0 ? _a : 0;
                                },
                                set: function (val) {
                                    this._readyState = val;
                                    setTimeout(() => {
                                        this.dispatchEvent(new Event('readystatechange'));
                                    });
                                },
                            },
                        });
                        xhr.readyState = 0;
                        const prototype = win.CapacitorWebXMLHttpRequest.prototype;
                        const isProgressEventAvailable = () => typeof ProgressEvent !== 'undefined' &&
                            ProgressEvent.prototype instanceof Event;
                        // XHR patch abort
                        prototype.abort = function () {
                            if (isRelativeOrProxyUrl(this._url)) {
                                return win.CapacitorWebXMLHttpRequest.abort.call(this);
                            }
                            this.readyState = 0;
                            setTimeout(() => {
                                this.dispatchEvent(new Event('abort'));
                                this.dispatchEvent(new Event('loadend'));
                            });
                        };
                        // XHR patch open
                        prototype.open = function (method, url) {
                            this._method = method.toLocaleUpperCase();
                            this._url = url;
                            if (!this._method ||
                                this._method === 'GET' ||
                                this._method === 'HEAD' ||
                                this._method === 'OPTIONS' ||
                                this._method === 'TRACE') {
                                if (isRelativeOrProxyUrl(url)) {
                                    return win.CapacitorWebXMLHttpRequest.open.call(this, method, url);
                                }
                                this._url = createProxyUrl(this._url, win);
                                return win.CapacitorWebXMLHttpRequest.open.call(this, method, this._url);
                            }
                            setTimeout(() => {
                                this.dispatchEvent(new Event('loadstart'));
                            });
                            this.readyState = 1;
                        };
                        // XHR patch set request header
                        prototype.setRequestHeader = function (header, value) {
                            if (isRelativeOrProxyUrl(this._url)) {
                                return win.CapacitorWebXMLHttpRequest.setRequestHeader.call(this, header, value);
                            }
                            this._headers[header] = value;
                        };
                        // XHR patch send
                        prototype.send = function (body) {
                            if (isRelativeOrProxyUrl(this._url)) {
                                return win.CapacitorWebXMLHttpRequest.send.call(this, body);
                            }
                            const tag = `CapacitorHttp XMLHttpRequest ${Date.now()} ${this._url}`;
                            console.time(tag);
                            try {
                                this.readyState = 2;
                                Object.defineProperties(this, {
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
                                convertBody(body).then(({ data, type, headers }) => {
                                    const otherHeaders = this._headers != null && Object.keys(this._headers).length > 0
                                        ? this._headers
                                        : undefined;
                                    // intercept request & pass to the bridge
                                    cap
                                        .nativePromise('CapacitorHttp', 'request', {
                                        url: this._url,
                                        method: this._method,
                                        data: data !== null ? data : undefined,
                                        headers: Object.assign(Object.assign({}, headers), otherHeaders),
                                        dataType: type,
                                    })
                                        .then((nativeResponse) => {
                                        var _a;
                                        // intercept & parse response before returning
                                        if (this.readyState == 2) {
                                            //TODO: Add progress event emission on native side
                                            if (isProgressEventAvailable()) {
                                                this.dispatchEvent(new ProgressEvent('progress', {
                                                    lengthComputable: true,
                                                    loaded: nativeResponse.data.length,
                                                    total: nativeResponse.data.length,
                                                }));
                                            }
                                            this._headers = nativeResponse.headers;
                                            this.status = nativeResponse.status;
                                            if (this.responseType === '' ||
                                                this.responseType === 'text') {
                                                this.response =
                                                    typeof nativeResponse.data !== 'string'
                                                        ? JSON.stringify(nativeResponse.data)
                                                        : nativeResponse.data;
                                            }
                                            else {
                                                this.response = nativeResponse.data;
                                            }
                                            this.responseText = ((_a = nativeResponse.headers['Content-Type']) === null || _a === void 0 ? void 0 : _a.startsWith('application/json'))
                                                ? JSON.stringify(nativeResponse.data)
                                                : nativeResponse.data;
                                            this.responseURL = nativeResponse.url;
                                            this.readyState = 4;
                                            setTimeout(() => {
                                                this.dispatchEvent(new Event('load'));
                                                this.dispatchEvent(new Event('loadend'));
                                            });
                                        }
                                        console.timeEnd(tag);
                                    })
                                        .catch((error) => {
                                        this.status = error.status;
                                        this._headers = error.headers;
                                        this.response = error.data;
                                        this.responseText = JSON.stringify(error.data);
                                        this.responseURL = error.url;
                                        this.readyState = 4;
                                        if (isProgressEventAvailable()) {
                                            this.dispatchEvent(new ProgressEvent('progress', {
                                                lengthComputable: false,
                                                loaded: 0,
                                                total: 0,
                                            }));
                                        }
                                        setTimeout(() => {
                                            this.dispatchEvent(new Event('error'));
                                            this.dispatchEvent(new Event('loadend'));
                                        });
                                        console.timeEnd(tag);
                                    });
                                });
                            }
                            catch (error) {
                                this.status = 500;
                                this._headers = {};
                                this.response = error;
                                this.responseText = error.toString();
                                this.responseURL = this._url;
                                this.readyState = 4;
                                if (isProgressEventAvailable()) {
                                    this.dispatchEvent(new ProgressEvent('progress', {
                                        lengthComputable: false,
                                        loaded: 0,
                                        total: 0,
                                    }));
                                }
                                setTimeout(() => {
                                    this.dispatchEvent(new Event('error'));
                                    this.dispatchEvent(new Event('loadend'));
                                });
                                console.timeEnd(tag);
                            }
                        };
                        // XHR patch getAllResponseHeaders
                        prototype.getAllResponseHeaders = function () {
                            if (isRelativeOrProxyUrl(this._url)) {
                                return win.CapacitorWebXMLHttpRequest.getAllResponseHeaders.call(this);
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
                        prototype.getResponseHeader = function (name) {
                            if (isRelativeOrProxyUrl(this._url)) {
                                return win.CapacitorWebXMLHttpRequest.getResponseHeader.call(this, name);
                            }
                            return this._headers[name];
                        };
                        Object.setPrototypeOf(xhr, prototype);
                        return xhr;
                    };
                }
            }
            // patch window.console on iOS and store original console fns
            const isIos = getPlatformId(win) === 'ios';
            if (win.console && isIos) {
                Object.defineProperties(win.console, BRIDGED_CONSOLE_METHODS.reduce((props, method) => {
                    const consoleMethod = win.console[method].bind(win.console);
                    props[method] = {
                        value: (...args) => {
                            const msgs = [...args];
                            cap.toNative('Console', 'log', {
                                level: method,
                                message: msgs.map(serializeConsoleMessage).join(' '),
                            });
                            return consoleMethod(...args);
                        },
                    };
                    return props;
                }, {}));
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
        function initNativeBridge(win) {
            const cap = win.Capacitor || {};
            // keep a collection of callbacks for native response data
            const callbacks = new Map();
            const webviewServerUrl = typeof win.WEBVIEW_SERVER_URL === 'string' ? win.WEBVIEW_SERVER_URL : '';
            cap.getServerUrl = () => webviewServerUrl;
            cap.convertFileSrc = filePath => convertFileSrcServerUrl(webviewServerUrl, filePath);
            // Counter of callback ids, randomized to avoid
            // any issues during reloads if a call comes back with
            // an existing callback id from an old session
            let callbackIdCount = Math.floor(Math.random() * 134217728);
            let postToNative = null;
            const isNativePlatform = () => true;
            const getPlatform = () => getPlatformId(win);
            cap.getPlatform = getPlatform;
            cap.isPluginAvailable = name => Object.prototype.hasOwnProperty.call(cap.Plugins, name);
            cap.isNativePlatform = isNativePlatform;
            // create the postToNative() fn if needed
            if (getPlatformId(win) === 'android') {
                // android platform
                postToNative = data => {
                    var _a;
                    try {
                        win.androidBridge.postMessage(JSON.stringify(data));
                    }
                    catch (e) {
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.error(e);
                    }
                };
            }
            else if (getPlatformId(win) === 'ios') {
                // ios platform
                postToNative = data => {
                    var _a;
                    try {
                        data.type = data.type ? data.type : 'message';
                        win.webkit.messageHandlers.bridge.postMessage(data);
                    }
                    catch (e) {
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.error(e);
                    }
                };
            }
            cap.handleWindowError = (msg, url, lineNo, columnNo, err) => {
                const str = msg.toLowerCase();
                if (str.indexOf('script error') > -1) ;
                else {
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
                var _a, _b;
                try {
                    if (typeof postToNative === 'function') {
                        let callbackId = '-1';
                        if (storedCallback &&
                            (typeof storedCallback.callback === 'function' ||
                                typeof storedCallback.resolve === 'function')) {
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
                    }
                    else {
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.warn(`implementation unavailable for: ${pluginName}`);
                    }
                }
                catch (e) {
                    (_b = win === null || win === void 0 ? void 0 : win.console) === null || _b === void 0 ? void 0 : _b.error(e);
                }
                return null;
            };
            if (win === null || win === void 0 ? void 0 : win.androidBridge) {
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
            const returnResult = (result) => {
                var _a, _b;
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
                                err[key] = result.error[key];
                                return err;
                            }, new cap.Exception(''));
                        }
                        if (typeof storedCall.callback === 'function') {
                            // callback
                            if (result.success) {
                                storedCall.callback(result.data);
                            }
                            else {
                                storedCall.callback(null, result.error);
                            }
                        }
                        else if (typeof storedCall.resolve === 'function') {
                            // promise
                            if (result.success) {
                                storedCall.resolve(result.data);
                            }
                            else {
                                storedCall.reject(result.error);
                            }
                            // no need to keep this stored callback
                            // around for a one time resolve promise
                            callbacks.delete(result.callbackId);
                        }
                    }
                    else if (!result.success && result.error) {
                        // no stored callback, but if there was an error let's log it
                        (_a = win === null || win === void 0 ? void 0 : win.console) === null || _a === void 0 ? void 0 : _a.warn(result.error);
                    }
                    if (result.save === false) {
                        callbacks.delete(result.callbackId);
                    }
                }
                catch (e) {
                    (_b = win === null || win === void 0 ? void 0 : win.console) === null || _b === void 0 ? void 0 : _b.error(e);
                }
                // always delete to prevent memory leaks
                // overkill but we're not sure what apps will do with this data
                delete result.data;
                delete result.error;
            };
            cap.nativeCallback = (pluginName, methodName, options, callback) => {
                if (typeof options === 'function') {
                    console.warn(`Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated.`);
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            cap.withPlugin = (_pluginId, _fn) => dummy;
            cap.Exception = CapacitorException;
            initEvents(win, cap);
            initLegacyHandlers(win, cap);
            initVendor(win, cap);
            win.Capacitor = cap;
        }
        initNativeBridge(w);
    };
    initBridge(typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
            ? self
            : typeof window !== 'undefined'
                ? window
                : typeof global !== 'undefined'
                    ? global
                    : {});

    dummy = initBridge;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
