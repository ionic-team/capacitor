// Platform: Capacitor
/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/
(function () {
  var PLATFORM_VERSION_BUILD_LABEL = '1.0.0';
  // file: src/scripts/require.js

  /* jshint -W079 */
  /* jshint -W020 */

  var require;
  var define;

  (function () {
    var modules = {};
    // Stack of moduleIds currently being built.
    var requireStack = [];
    // Map of module ID -> index into requireStack of modules currently being built.
    var inProgressModules = {};
    var SEPARATOR = '.';

    function build(module) {
      var factory = module.factory;
      var localRequire = function (id) {
        var resultantId = id;
        // Its a relative path, so lop off the last portion and add the id (minus "./")
        if (id.charAt(0) === '.') {
          resultantId = module.id.slice(0, module.id.lastIndexOf(SEPARATOR)) + SEPARATOR + id.slice(2);
        }
        return require(resultantId);
      };
      module.exports = {};
      delete module.factory;
      factory(localRequire, module.exports, module);
      return module.exports;
    }

    require = function (id) {
      if (!modules[id]) {
        throw 'module ' + id + ' not found';
      } else if (id in inProgressModules) {
        var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
        throw 'Cycle in require graph: ' + cycle;
      }
      if (modules[id].factory) {
        try {
          inProgressModules[id] = requireStack.length;
          requireStack.push(id);
          return build(modules[id]);
        } finally {
          delete inProgressModules[id];
          requireStack.pop();
        }
      }
      return modules[id].exports;
    };

    define = function (id, factory) {
      if (modules[id]) {
        throw 'module ' + id + ' already defined';
      }

      modules[id] = {
        id: id,
        factory: factory,
      };
    };

    define.remove = function (id) {
      delete modules[id];
    };

    define.moduleMap = modules;
  })();

  // Export for use in node
  if (typeof module === 'object' && typeof require === 'function') {
    module.exports.require = require;
    module.exports.define = define;
  }

  // file: src/cordova.js
  define('cordova', function (require, exports, module) {
    var channel = require('cordova/channel');
    var platform = require('cordova/platform');

    /**
     * Intercept calls to addEventListener + removeEventListener and handle deviceready,
     * resume, and pause events.
     */
    var m_document_addEventListener = document.addEventListener;
    var m_document_removeEventListener = document.removeEventListener;
    var m_window_addEventListener = window.addEventListener;
    var m_window_removeEventListener = window.removeEventListener;

    /**
     * Houses custom event handlers to intercept on document + window event listeners.
     */
    var documentEventHandlers = {};
    var windowEventHandlers = {};

    document.addEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      if (typeof documentEventHandlers[e] !== 'undefined') {
        documentEventHandlers[e].subscribe(handler);
      } else {
        m_document_addEventListener.call(document, evt, handler, capture);
      }
    };

    window.addEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      if (typeof windowEventHandlers[e] !== 'undefined') {
        windowEventHandlers[e].subscribe(handler);
      } else {
        m_window_addEventListener.call(window, evt, handler, capture);
      }
    };

    document.removeEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      // If unsubscribing from an event that is handled by a plugin
      if (typeof documentEventHandlers[e] !== 'undefined') {
        documentEventHandlers[e].unsubscribe(handler);
      } else {
        m_document_removeEventListener.call(document, evt, handler, capture);
      }
    };

    window.removeEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      // If unsubscribing from an event that is handled by a plugin
      if (typeof windowEventHandlers[e] !== 'undefined') {
        windowEventHandlers[e].unsubscribe(handler);
      } else {
        m_window_removeEventListener.call(window, evt, handler, capture);
      }
    };

    /* eslint-disable no-undef */
    var cordova = {
      define: define,
      require: require,
      version: PLATFORM_VERSION_BUILD_LABEL,
      platformVersion: PLATFORM_VERSION_BUILD_LABEL,
      platformId: platform.id,

      /* eslint-enable no-undef */

      /**
       * Methods to add/remove your own addEventListener hijacking on document + window.
       */
      addWindowEventHandler: function (event) {
        return (windowEventHandlers[event] = channel.create(event));
      },
      addStickyDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.createSticky(event));
      },
      addDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.create(event));
      },
      removeWindowEventHandler: function (event) {
        delete windowEventHandlers[event];
      },
      removeDocumentEventHandler: function (event) {
        delete documentEventHandlers[event];
      },
      /**
       * Retrieve original event handlers that were replaced by Cordova
       *
       * @return object
       */
      getOriginalHandlers: function () {
        return {
          document: {
            addEventListener: m_document_addEventListener,
            removeEventListener: m_document_removeEventListener,
          },
          window: {
            addEventListener: m_window_addEventListener,
            removeEventListener: m_window_removeEventListener,
          },
        };
      },
      /**
       * Method to fire event from native code
       * bNoDetach is required for events which cause an exception which needs to be caught in native code
       */
      fireDocumentEvent: function (type, data, bNoDetach) {
        var evt = window.Capacitor.createEvent(type, data);
        if (typeof documentEventHandlers[type] !== 'undefined') {
          if (bNoDetach) {
            documentEventHandlers[type].fire(evt);
          } else {
            setTimeout(function () {
              // Fire deviceready on listeners that were registered before cordova.js was loaded.
              if (type === 'deviceready') {
                document.dispatchEvent(evt);
              }
              documentEventHandlers[type].fire(evt);
            }, 0);
          }
        } else {
          document.dispatchEvent(evt);
        }
      },
      fireWindowEvent: function (type, data) {
        var evt = window.Capacitor.createEvent(type, data);
        if (typeof windowEventHandlers[type] !== 'undefined') {
          setTimeout(function () {
            windowEventHandlers[type].fire(evt);
          }, 0);
        } else {
          window.dispatchEvent(evt);
        }
      },

      /**
       * Plugin callback mechanism.
       */
      // Randomize the starting callbackId to avoid collisions after refreshing or navigating.
      // This way, it's very unlikely that any new callback would get the same callbackId as an old callback.
      callbackId: Math.floor(Math.random() * 2000000000),
      callbacks: {},
      callbackStatus: {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9,
      },

      /**
       * Called by native code when returning successful result from an action.
       */
      callbackSuccess: function (callbackId, args) {
        cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
      },

      /**
       * Called by native code when returning error result from an action.
       */
      callbackError: function (callbackId, args) {
        // TODO: Deprecate callbackSuccess and callbackError in favour of callbackFromNative.
        // Derive success from status.
        cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
      },

      /**
       * Called by native code when returning the result from an action.
       */
      callbackFromNative: function (callbackId, isSuccess, status, args, keepCallback) {
        try {
          var callback = cordova.callbacks[callbackId];
          if (callback) {
            if (isSuccess && status === cordova.callbackStatus.OK) {
              callback.success && callback.success.apply(null, args);
            } else if (!isSuccess) {
              callback.fail && callback.fail.apply(null, args);
            }
            /*
                        else
                            Note, this case is intentionally not caught.
                            this can happen if isSuccess is true, but callbackStatus is NO_RESULT
                            which is used to remove a callback from the list without calling the callbacks
                            typically keepCallback is false in this case
                        */
            // Clear callback if not expecting any more results
            if (!keepCallback) {
              delete cordova.callbacks[callbackId];
            }
          }
        } catch (err) {
          var msg = 'Error in ' + (isSuccess ? 'Success' : 'Error') + ' callbackId: ' + callbackId + ' : ' + err;
          console && console.log && console.log(msg);
          cordova.fireWindowEvent('cordovacallbackerror', { message: msg });
          throw err;
        }
      },
      addConstructor: function (func) {
        channel.onCordovaReady.subscribe(function () {
          try {
            func();
          } catch (e) {
            console.log('Failed to run constructor: ' + e);
          }
        });
      },
    };

    module.exports = cordova;
  });

  // file: src/common/argscheck.js
  define('cordova/argscheck', function (require, exports, module) {
    var utils = require('cordova/utils');

    var moduleExports = module.exports;

    var typeMap = {
      A: 'Array',
      D: 'Date',
      N: 'Number',
      S: 'String',
      F: 'Function',
      O: 'Object',
    };

    function extractParamName(callee, argIndex) {
      return /.*?\((.*?)\)/.exec(callee)[1].split(', ')[argIndex];
    }

    function checkArgs(spec, functionName, args, opt_callee) {
      if (!moduleExports.enableChecks) {
        return;
      }
      var errMsg = null;
      var typeName;
      for (var i = 0; i < spec.length; ++i) {
        var c = spec.charAt(i);
        var cUpper = c.toUpperCase();
        var arg = args[i];
        // Asterix means allow anything.
        if (c === '*') {
          continue;
        }
        typeName = utils.typeName(arg);
        if ((arg === null || arg === undefined) && c === cUpper) {
          continue;
        }
        if (typeName !== typeMap[cUpper]) {
          errMsg = 'Expected ' + typeMap[cUpper];
          break;
        }
      }
      if (errMsg) {
        errMsg += ', but got ' + typeName + '.';
        errMsg =
          'Wrong type for parameter "' +
          extractParamName(opt_callee || args.callee, i) +
          '" of ' +
          functionName +
          ': ' +
          errMsg;
        // Don't log when running unit tests.
        if (typeof jasmine === 'undefined') {
          console.error(errMsg);
        }
        throw TypeError(errMsg);
      }
    }

    function getValue(value, defaultValue) {
      return value === undefined ? defaultValue : value;
    }

    moduleExports.checkArgs = checkArgs;
    moduleExports.getValue = getValue;
    moduleExports.enableChecks = true;
  });

  // file: src/common/base64.js
  define('cordova/base64', function (require, exports, module) {
    var base64 = exports;

    base64.fromArrayBuffer = function (arrayBuffer) {
      var array = new Uint8Array(arrayBuffer);
      return uint8ToBase64(array);
    };

    base64.toArrayBuffer = function (str) {
      var decodedStr = typeof atob !== 'undefined' ? atob(str) : Buffer.from(str, 'base64').toString('binary'); // eslint-disable-line no-undef
      var arrayBuffer = new ArrayBuffer(decodedStr.length);
      var array = new Uint8Array(arrayBuffer);
      for (var i = 0, len = decodedStr.length; i < len; i++) {
        array[i] = decodedStr.charCodeAt(i);
      }
      return arrayBuffer;
    };

    // ------------------------------------------------------------------------------

    /* This code is based on the performance tests at http://jsperf.com/b64tests
     * This 12-bit-at-a-time algorithm was the best performing version on all
     * platforms tested.
     */

    var b64_6bit = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64_12bit;

    var b64_12bitTable = function () {
      b64_12bit = [];
      for (var i = 0; i < 64; i++) {
        for (var j = 0; j < 64; j++) {
          b64_12bit[i * 64 + j] = b64_6bit[i] + b64_6bit[j];
        }
      }
      b64_12bitTable = function () {
        return b64_12bit;
      };
      return b64_12bit;
    };

    function uint8ToBase64(rawData) {
      var numBytes = rawData.byteLength;
      var output = '';
      var segment;
      var table = b64_12bitTable();
      for (var i = 0; i < numBytes - 2; i += 3) {
        segment = (rawData[i] << 16) + (rawData[i + 1] << 8) + rawData[i + 2];
        output += table[segment >> 12];
        output += table[segment & 0xfff];
      }
      if (numBytes - i === 2) {
        segment = (rawData[i] << 16) + (rawData[i + 1] << 8);
        output += table[segment >> 12];
        output += b64_6bit[(segment & 0xfff) >> 6];
        output += '=';
      } else if (numBytes - i === 1) {
        segment = rawData[i] << 16;
        output += table[segment >> 12];
        output += '==';
      }
      return output;
    }
  });

  // file: src/common/builder.js
  define('cordova/builder', function (require, exports, module) {
    var utils = require('cordova/utils');

    function each(objects, func, context) {
      for (var prop in objects) {
        if (objects.hasOwnProperty(prop)) {
          func.apply(context, [objects[prop], prop]);
        }
      }
    }

    function clobber(obj, key, value) {
      exports.replaceHookForTesting(obj, key);
      var needsProperty = false;
      try {
        obj[key] = value;
      } catch (e) {
        needsProperty = true;
      }
      // Getters can only be overridden by getters.
      if (needsProperty || obj[key] !== value) {
        utils.defineGetter(obj, key, function () {
          return value;
        });
      }
    }

    function assignOrWrapInDeprecateGetter(obj, key, value, message) {
      if (message) {
        utils.defineGetter(obj, key, function () {
          console.log(message);
          delete obj[key];
          clobber(obj, key, value);
          return value;
        });
      } else {
        clobber(obj, key, value);
      }
    }

    function include(parent, objects, clobber, merge) {
      each(objects, function (obj, key) {
        try {
          var result = obj.path ? require(obj.path) : {};

          if (clobber) {
            // Clobber if it doesn't exist.
            if (typeof parent[key] === 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
            } else if (typeof obj.path !== 'undefined') {
              // If merging, merge properties onto parent, otherwise, clobber.
              if (merge) {
                recursiveMerge(parent[key], result);
              } else {
                assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              }
            }
            result = parent[key];
          } else {
            // Overwrite if not currently defined.
            if (typeof parent[key] === 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
            } else {
              // Set result to what already exists, so we can build children into it if they exist.
              result = parent[key];
            }
          }

          if (obj.children) {
            include(result, obj.children, clobber, merge);
          }
        } catch (e) {
          utils.alert('Exception building Cordova JS globals: ' + e + ' for key "' + key + '"');
        }
      });
    }

    /**
     * Merge properties from one object onto another recursively.  Properties from
     * the src object will overwrite existing target property.
     *
     * @param target Object to merge properties into.
     * @param src Object to merge properties from.
     */
    function recursiveMerge(target, src) {
      for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
          if (target.prototype && target.prototype.constructor === target) {
            // If the target object is a constructor override off prototype.
            clobber(target.prototype, prop, src[prop]);
          } else {
            if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
              recursiveMerge(target[prop], src[prop]);
            } else {
              clobber(target, prop, src[prop]);
            }
          }
        }
      }
    }

    exports.buildIntoButDoNotClobber = function (objects, target) {
      include(target, objects, false, false);
    };
    exports.buildIntoAndClobber = function (objects, target) {
      include(target, objects, true, false);
    };
    exports.buildIntoAndMerge = function (objects, target) {
      include(target, objects, true, true);
    };
    exports.recursiveMerge = recursiveMerge;
    exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;
    exports.replaceHookForTesting = function () {};
  });

  // file: src/common/channel.js
  define('cordova/channel', function (require, exports, module) {
    var utils = require('cordova/utils');
    var nextGuid = 1;

    /**
     * Custom pub-sub "channel" that can have functions subscribed to it
     * This object is used to define and control firing of events for
     * cordova initialization, as well as for custom events thereafter.
     *
     * The order of events during page load and Cordova startup is as follows:
     *
     * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
     * onNativeReady*              Internal event that indicates the Cordova native side is ready.
     * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
     * onDeviceReady*              User event fired to indicate that Cordova is ready
     * onResume                    User event fired to indicate a start/resume lifecycle event
     * onPause                     User event fired to indicate a pause lifecycle event
     *
     * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
     * All listeners that subscribe after the event is fired will be executed right away.
     *
     * The only Cordova events that user code should register for are:
     *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
     *      pause                 App has moved to background
     *      resume                App has returned to foreground
     *
     * Listeners can be registered as:
     *      document.addEventListener("deviceready", myDeviceReadyListener, false);
     *      document.addEventListener("resume", myResumeListener, false);
     *      document.addEventListener("pause", myPauseListener, false);
     *
     * The DOM lifecycle events should be used for saving and restoring state
     *      window.onload
     *      window.onunload
     *
     */

    /**
     * Channel
     * @constructor
     * @param type  String the channel name
     */
    var Channel = function (type, sticky) {
      this.type = type;
      // Map of guid -> function.
      this.handlers = {};
      // 0 = Non-sticky, 1 = Sticky non-fired, 2 = Sticky fired.
      this.state = sticky ? 1 : 0;
      // Used in sticky mode to remember args passed to fire().
      this.fireArgs = null;
      // Used by onHasSubscribersChange to know if there are any listeners.
      this.numHandlers = 0;
      // Function that is called when the first listener is subscribed, or when
      // the last listener is unsubscribed.
      this.onHasSubscribersChange = null;
    };
    var channel = {
      /**
       * Calls the provided function only after all of the channels specified
       * have been fired. All channels must be sticky channels.
       */
      join: function (h, c) {
        var len = c.length;
        var i = len;
        var f = function () {
          if (!--i) h();
        };
        for (var j = 0; j < len; j++) {
          if (c[j].state === 0) {
            throw Error('Can only use join with sticky channels.');
          }
          c[j].subscribe(f);
        }
        if (!len) h();
      },
      /* eslint-disable no-return-assign */
      create: function (type) {
        return (channel[type] = new Channel(type, false));
      },
      createSticky: function (type) {
        return (channel[type] = new Channel(type, true));
      },
      /* eslint-enable no-return-assign */
      /**
       * cordova Channels that must fire before "deviceready" is fired.
       */
      deviceReadyChannelsArray: [],
      deviceReadyChannelsMap: {},

      /**
       * Indicate that a feature needs to be initialized before it is ready to be used.
       * This holds up Cordova's "deviceready" event until the feature has been initialized
       * and Cordova.initComplete(feature) is called.
       *
       * @param feature {String}     The unique feature name
       */
      waitForInitialization: function (feature) {
        if (feature) {
          var c = channel[feature] || this.createSticky(feature);
          this.deviceReadyChannelsMap[feature] = c;
          this.deviceReadyChannelsArray.push(c);
        }
      },

      /**
       * Indicate that initialization code has completed and the feature is ready to be used.
       *
       * @param feature {String}     The unique feature name
       */
      initializationComplete: function (feature) {
        var c = this.deviceReadyChannelsMap[feature];
        if (c) {
          c.fire();
        }
      },
    };

    function checkSubscriptionArgument(argument) {
      if (typeof argument !== 'function' && typeof argument.handleEvent !== 'function') {
        throw new Error(
          'Must provide a function or an EventListener object ' + 'implementing the handleEvent interface.',
        );
      }
    }

    /**
     * Subscribes the given function to the channel. Any time that
     * Channel.fire is called so too will the function.
     * Optionally specify an execution context for the function
     * and a guid that can be used to stop subscribing to the channel.
     * Returns the guid.
     */
    Channel.prototype.subscribe = function (eventListenerOrFunction, eventListener) {
      checkSubscriptionArgument(eventListenerOrFunction);
      var handleEvent, guid;

      if (eventListenerOrFunction && typeof eventListenerOrFunction === 'object') {
        // Received an EventListener object implementing the handleEvent interface
        handleEvent = eventListenerOrFunction.handleEvent;
        eventListener = eventListenerOrFunction;
      } else {
        // Received a function to handle event
        handleEvent = eventListenerOrFunction;
      }

      if (this.state === 2) {
        handleEvent.apply(eventListener || this, this.fireArgs);
        return;
      }

      guid = eventListenerOrFunction.observer_guid;
      if (typeof eventListener === 'object') {
        handleEvent = utils.close(eventListener, handleEvent);
      }

      if (!guid) {
        // First time any channel has seen this subscriber
        guid = '' + nextGuid++;
      }
      handleEvent.observer_guid = guid;
      eventListenerOrFunction.observer_guid = guid;

      // Don't add the same handler more than once.
      if (!this.handlers[guid]) {
        this.handlers[guid] = handleEvent;
        this.numHandlers++;
        if (this.numHandlers === 1) {
          this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
      }
    };

    /**
     * Unsubscribes the function with the given guid from the channel.
     */
    Channel.prototype.unsubscribe = function (eventListenerOrFunction) {
      checkSubscriptionArgument(eventListenerOrFunction);
      var handleEvent, guid, handler;

      if (eventListenerOrFunction && typeof eventListenerOrFunction === 'object') {
        // Received an EventListener object implementing the handleEvent interface
        handleEvent = eventListenerOrFunction.handleEvent;
      } else {
        // Received a function to handle event
        handleEvent = eventListenerOrFunction;
      }

      guid = handleEvent.observer_guid;
      handler = this.handlers[guid];
      if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0) {
          this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
      }
    };

    /**
     * Calls all functions subscribed to this channel.
     */
    Channel.prototype.fire = function (e) {
      var fail = false; // eslint-disable-line no-unused-vars
      var fireArgs = Array.prototype.slice.call(arguments);
      // Apply stickiness.
      if (this.state === 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
      }
      if (this.numHandlers) {
        // Copy the values first so that it is safe to modify it from within
        // callbacks.
        var toCall = [];
        for (var item in this.handlers) {
          toCall.push(this.handlers[item]);
        }
        for (var i = 0; i < toCall.length; ++i) {
          toCall[i].apply(this, fireArgs);
        }
        if (this.state === 2 && this.numHandlers) {
          this.numHandlers = 0;
          this.handlers = {};
          this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
      }
    };

    // defining them here so they are ready super fast!
    // DOM event that is received when the web page is loaded and parsed.
    channel.createSticky('onDOMContentLoaded');

    // Event to indicate the Cordova native side is ready.
    channel.createSticky('onNativeReady');

    // Event to indicate that all Cordova JavaScript objects have been created
    // and it's time to run plugin constructors.
    channel.createSticky('onCordovaReady');

    // Event to indicate that all automatically loaded JS plugins are loaded and ready.
    // FIXME remove this
    channel.createSticky('onPluginsReady');

    // Event to indicate that Cordova is ready
    channel.createSticky('onDeviceReady');

    // Event to indicate a resume lifecycle event
    channel.create('onResume');

    // Event to indicate a pause lifecycle event
    channel.create('onPause');

    // Channels that must fire before "deviceready" is fired.
    channel.waitForInitialization('onCordovaReady');
    channel.waitForInitialization('onDOMContentLoaded');

    module.exports = channel;
  });

  define('cordova/exec', function (require, exports, module) {
    /*global require, module, atob, document */

    /**
     * Creates a gap bridge iframe used to notify the native code about queued
     * commands.
     */
    var cordova = require('cordova'),
      utils = require('cordova/utils'),
      base64 = require('cordova/base64'),
      execIframe,
      commandQueue = [], // Contains pending JS->Native messages.
      isInContextOfEvalJs = 0,
      failSafeTimerId = 0;

    function massageArgsJsToNative(args) {
      if (window.androidBridge) {
        for (var i = 0; i < args.length; i++) {
          if (utils.typeName(args[i]) == 'ArrayBuffer') {
            args[i] = base64.fromArrayBuffer(args[i]);
          }
        }
        return args;
      } else {
        if (!args || utils.typeName(args) !== 'Array') {
          return args;
        }
        var ret = [];
        args.forEach(function (arg, i) {
          if (utils.typeName(arg) === 'ArrayBuffer') {
            ret.push({
              CDVType: 'ArrayBuffer',
              data: base64.fromArrayBuffer(arg),
            });
          } else {
            ret.push(arg);
          }
        });
        return ret;
      }
    }

    function massageMessageNativeToJs(message) {
      if (message.CDVType === 'ArrayBuffer') {
        var stringToArrayBuffer = function (str) {
          var ret = new Uint8Array(str.length);
          for (var i = 0; i < str.length; i++) {
            ret[i] = str.charCodeAt(i);
          }
          return ret.buffer;
        };
        var base64ToArrayBuffer = function (b64) {
          return stringToArrayBuffer(atob(b64)); // eslint-disable-line no-undef
        };
        message = base64ToArrayBuffer(message.data);
      }
      return message;
    }

    function convertMessageToArgsNativeToJs(message) {
      var args = [];
      if (!message || !message.hasOwnProperty('CDVType')) {
        args.push(message);
      } else if (message.CDVType === 'MultiPart') {
        message.messages.forEach(function (e) {
          args.push(massageMessageNativeToJs(e));
        });
      } else {
        args.push(massageMessageNativeToJs(message));
      }
      return args;
    }

    var capacitorExec = function () {
      // detect change in bridge, if there is a change, we forward to new bridge

      var successCallback, failCallback, service, action, actionArgs;
      var callbackId = null;
      if (typeof arguments[0] !== 'string') {
        // FORMAT ONE
        successCallback = arguments[0];
        failCallback = arguments[1];
        service = arguments[2];
        action = arguments[3];
        actionArgs = arguments[4];

        // Since we need to maintain backwards compatibility, we have to pass
        // an invalid callbackId even if no callback was provided since plugins
        // will be expecting it. The Cordova.exec() implementation allocates
        // an invalid callbackId and passes it even if no callbacks were given.
        callbackId = 'INVALID';
      } else {
        throw new Error(
          'The old format of this exec call has been removed (deprecated since 2.1). Change to: ' + // eslint-disable-line
            "cordova.exec(null, null, 'Service', 'action', [ arg1, arg2 ]);",
        );
      }

      // If actionArgs is not provided, default to an empty array
      actionArgs = actionArgs || [];

      // Register the callbacks and add the callbackId to the positional
      // arguments if given.
      if (successCallback || failCallback) {
        callbackId = service + cordova.callbackId++;
        cordova.callbacks[callbackId] = {
          success: successCallback,
          fail: failCallback,
        };
      }

      // Properly encode ArrayBuffer action arguments
      actionArgs = massageArgsJsToNative(actionArgs);
      actionArgs = JSON.parse(JSON.stringify(actionArgs));
      var command = {
        type: 'cordova',
        callbackId: callbackId,
        service: service,
        action: action,
        actionArgs: actionArgs,
      };
      if (window.androidBridge) {
        window.androidBridge.postMessage(JSON.stringify(command));
      } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bridge) {
        window.webkit.messageHandlers.bridge.postMessage(command);
      }
    };

    // CB-10530
    function proxyChanged() {
      var cexec = cordovaExec();

      return (
        execProxy !== cexec && capacitorExec !== cexec // proxy objects are different // proxy object is not the current capacitorExec
      );
    }

    // CB-10106
    function handleBridgeChange() {
      if (proxyChanged()) {
        var commandString = commandQueue.shift();
        while (commandString) {
          var command = JSON.parse(commandString);
          var callbackId = command[0];
          var service = command[1];
          var action = command[2];
          var actionArgs = command[3];
          var callbacks = cordova.callbacks[callbackId] || {};

          execProxy(callbacks.success, callbacks.fail, service, action, actionArgs);

          commandString = commandQueue.shift();
        }
        return true;
      }

      return false;
    }

    function pokeNative() {
      // CB-5488 - Don't attempt to create iframe before document.body is available.
      if (!document.body) {
        setTimeout(pokeNative);
        return;
      }

      // Check if they've removed it from the DOM, and put it back if so.
      if (execIframe && execIframe.contentWindow) {
        execIframe.contentWindow.location = 'gap://ready';
      } else {
        execIframe = document.createElement('iframe');
        execIframe.style.display = 'none';
        execIframe.src = 'gap://ready';
        document.body.appendChild(execIframe);
      }
      // Use a timer to protect against iframe being unloaded during the poke (CB-7735).
      // This makes the bridge ~ 7% slower, but works around the poke getting lost
      // when the iframe is removed from the DOM.
      // An onunload listener could be used in the case where the iframe has just been
      // created, but since unload events fire only once, it doesn't work in the normal
      // case of iframe reuse (where unload will have already fired due to the attempted
      // navigation of the page).
      failSafeTimerId = setTimeout(function () {
        if (commandQueue.length) {
          // CB-10106 - flush the queue on bridge change
          if (!handleBridgeChange()) {
            pokeNative();
          }
        }
      }, 50); // Making this > 0 improves performance (marginally) in the normal case (where it doesn't fire).
    }

    capacitorExec.nativeFetchMessages = function () {
      // Stop listing for window detatch once native side confirms poke.
      if (failSafeTimerId) {
        clearTimeout(failSafeTimerId);
        failSafeTimerId = 0;
      }
      // Each entry in commandQueue is a JSON string already.
      if (!commandQueue.length) {
        return '';
      }
      var json = '[' + commandQueue.join(',') + ']';
      commandQueue.length = 0;
      return json;
    };

    capacitorExec.nativeCallback = function (callbackId, status, message, keepCallback, debug) {
      var success = status === 0 || status === 1;
      var args = convertMessageToArgsNativeToJs(message);
      Promise.resolve().then(function () {
        cordova.callbackFromNative(callbackId, success, status, args, keepCallback); // eslint-disable-line
      });
    };

    // for backwards compatibility
    capacitorExec.nativeEvalAndFetch = function (func) {
      try {
        func();
      } catch (e) {
        console.log(e);
      }
    };

    // Proxy the exec for bridge changes. See CB-10106
    function cordovaExec() {
      var cexec = require('cordova/exec');
      var cexec_valid =
        typeof cexec.nativeFetchMessages === 'function' &&
        typeof cexec.nativeEvalAndFetch === 'function' &&
        typeof cexec.nativeCallback === 'function';
      return cexec_valid && execProxy !== cexec ? cexec : capacitorExec;
    }
    function execProxy() {
      cordovaExec().apply(null, arguments);
    }

    execProxy.nativeFetchMessages = function () {
      return cordovaExec().nativeFetchMessages.apply(null, arguments);
    };

    execProxy.nativeEvalAndFetch = function () {
      return cordovaExec().nativeEvalAndFetch.apply(null, arguments);
    };

    execProxy.nativeCallback = function () {
      return cordovaExec().nativeCallback.apply(null, arguments);
    };

    module.exports = execProxy;
  });

  // file: src/common/exec/proxy.js
  define('cordova/exec/proxy', function (require, exports, module) {
    // internal map of proxy function
    var CommandProxyMap = {};

    module.exports = {
      // example: cordova.commandProxy.add("Accelerometer",{getCurrentAcceleration: function(successCallback, errorCallback, options) {...},...);
      add: function (id, proxyObj) {
        console.log('adding proxy for ' + id);
        CommandProxyMap[id] = proxyObj;
        return proxyObj;
      },

      // cordova.commandProxy.remove("Accelerometer");
      remove: function (id) {
        var proxy = CommandProxyMap[id];
        delete CommandProxyMap[id];
        CommandProxyMap[id] = null;
        return proxy;
      },

      get: function (service, action) {
        return CommandProxyMap[service] ? CommandProxyMap[service][action] : null;
      },
    };
  });

  // file: src/common/init.js
  define('cordova/init', function (require, exports, module) {
    var channel = require('cordova/channel');
    var cordova = require('cordova');
    var modulemapper = require('cordova/modulemapper');
    var platform = require('cordova/platform');
    var pluginloader = require('cordova/pluginloader');
    var utils = require('cordova/utils');

    var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];

    function logUnfiredChannels(arr) {
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i].state !== 2) {
          console.log('Channel not fired: ' + arr[i].type);
        }
      }
    }

    window.setTimeout(function () {
      if (channel.onDeviceReady.state !== 2) {
        console.log('deviceready has not fired after 5 seconds.');
        logUnfiredChannels(platformInitChannelsArray);
        logUnfiredChannels(channel.deviceReadyChannelsArray);
      }
    }, 5000);

    // Replace navigator before any modules are required(), to ensure it happens as soon as possible.
    // We replace it so that properties that can't be clobbered can instead be overridden.
    function replaceNavigator(origNavigator) {
      var CordovaNavigator = function () {};
      CordovaNavigator.prototype = origNavigator;
      var newNavigator = new CordovaNavigator();
      // This work-around really only applies to new APIs that are newer than Function.bind.
      // Without it, APIs such as getGamepads() break.
      if (CordovaNavigator.bind) {
        for (var key in origNavigator) {
          if (typeof origNavigator[key] === 'function') {
            newNavigator[key] = origNavigator[key].bind(origNavigator);
          } else {
            (function (k) {
              utils.defineGetterSetter(newNavigator, key, function () {
                return origNavigator[k];
              });
            })(key);
          }
        }
      }
      return newNavigator;
    }

    if (window.navigator) {
      window.navigator = replaceNavigator(window.navigator);
    }

    // Register pause, resume and deviceready channels as events on document.
    channel.onPause = cordova.addDocumentEventHandler('pause');
    channel.onResume = cordova.addDocumentEventHandler('resume');
    channel.onActivated = cordova.addDocumentEventHandler('activated');
    channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');

    // Listen for DOMContentLoaded and notify our channel subscribers.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      channel.onDOMContentLoaded.fire();
    } else {
      document.addEventListener(
        'DOMContentLoaded',
        function () {
          channel.onDOMContentLoaded.fire();
        },
        false,
      );
    }

    // _nativeReady is global variable that the native side can set
    // to signify that the native code is ready. It is a global since
    // it may be called before any cordova JS is ready.
    if (window._nativeReady) {
      channel.onNativeReady.fire();
    }

    modulemapper.clobbers('cordova', 'cordova');
    modulemapper.clobbers('cordova/exec', 'cordova.exec');
    modulemapper.clobbers('cordova/exec', 'Cordova.exec');

    // Call the platform-specific initialization.
    platform.bootstrap && platform.bootstrap();

    // Wrap in a setTimeout to support the use-case of having plugin JS appended to cordova.js.
    // The delay allows the attached modules to be defined before the plugin loader looks for them.
    setTimeout(function () {
      pluginloader.load(function () {
        channel.onPluginsReady.fire();
      });
    }, 0);

    /**
     * Create all cordova objects once native side is ready.
     */
    channel.join(function () {
      modulemapper.mapModules(window);

      platform.initialize && platform.initialize();

      // Fire event to notify that all objects are created
      channel.onCordovaReady.fire();

      // Fire onDeviceReady event once page has fully loaded, all
      // constructors have run and cordova info has been received from native
      // side.
      channel.join(function () {
        require('cordova').fireDocumentEvent('deviceready');
      }, channel.deviceReadyChannelsArray);
    }, platformInitChannelsArray);
  });

  // file: src/common/modulemapper.js
  define('cordova/modulemapper', function (require, exports, module) {
    var builder = require('cordova/builder');
    var moduleMap = define.moduleMap; // eslint-disable-line no-undef
    var symbolList;
    var deprecationMap;

    exports.reset = function () {
      symbolList = [];
      deprecationMap = {};
    };

    function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
      if (!(moduleName in moduleMap)) {
        throw new Error('Module ' + moduleName + ' does not exist.');
      }
      symbolList.push(strategy, moduleName, symbolPath);
      if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
      }
    }

    // Note: Android 2.3 does have Function.bind().
    exports.clobbers = function (moduleName, symbolPath, opt_deprecationMessage) {
      addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
    };

    exports.merges = function (moduleName, symbolPath, opt_deprecationMessage) {
      addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
    };

    exports.defaults = function (moduleName, symbolPath, opt_deprecationMessage) {
      addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
    };

    exports.runs = function (moduleName) {
      addEntry('r', moduleName, null);
    };

    function prepareNamespace(symbolPath, context) {
      if (!symbolPath) {
        return context;
      }
      var parts = symbolPath.split('.');
      var cur = context;
      for (var i = 0, part; (part = parts[i]); ++i) {
        // eslint-disable-line no-cond-assign
        cur = cur[part] = cur[part] || {};
      }
      return cur;
    }

    exports.mapModules = function (context) {
      var origSymbols = {};
      context.CDV_origSymbols = origSymbols;
      for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var module = require(moduleName);
        // <runs/>
        if (strategy === 'r') {
          continue;
        }
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf('.');
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);

        var deprecationMsg =
          symbolPath in deprecationMap
            ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg
            : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];

        if (strategy === 'm' && target) {
          builder.recursiveMerge(target, module);
        } else if ((strategy === 'd' && !target) || strategy !== 'd') {
          if (!(symbolPath in origSymbols)) {
            origSymbols[symbolPath] = target;
          }
          builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
      }
    };

    exports.getOriginalSymbol = function (context, symbolPath) {
      var origSymbols = context.CDV_origSymbols;
      if (origSymbols && symbolPath in origSymbols) {
        return origSymbols[symbolPath];
      }
      var parts = symbolPath.split('.');
      var obj = context;
      for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
      }
      return obj;
    };

    exports.reset();
  });

  define('cordova/platform', function (require, exports, module) {
    module.exports = {
      id: window.Capacitor.getPlatform(),
      bootstrap: function () {
        require('cordova/channel').onNativeReady.fire();
      },
    };
  });

  // file: src/common/pluginloader.js
  define('cordova/pluginloader', function (require, exports, module) {
    var modulemapper = require('cordova/modulemapper');

    function onScriptLoadingComplete(moduleList, finishPluginLoading) {
      console.log('onscript loading complete');
      // Loop through all the plugins and then through their clobbers and merges.
      for (var i = 0, module; (module = moduleList[i]); i++) {
        // eslint-disable-line no-cond-assign
        if (module.clobbers && module.clobbers.length) {
          for (var j = 0; j < module.clobbers.length; j++) {
            modulemapper.clobbers(module.id, module.clobbers[j]);
          }
        }

        if (module.merges && module.merges.length) {
          for (var k = 0; k < module.merges.length; k++) {
            modulemapper.merges(module.id, module.merges[k]);
          }
        }

        // Finally, if runs is truthy we want to simply require() the module.
        if (module.runs) {
          modulemapper.runs(module.id);
        }
      }

      finishPluginLoading();
    }

    // Tries to load all plugins' js-modules.
    // This is an async process, but onDeviceReady is blocked on onPluginsReady.
    // onPluginsReady is fired when there are no plugins to load, or they are all done.
    exports.load = function (callback) {
      var moduleList = require('cordova/plugin_list');
      onScriptLoadingComplete(moduleList, callback);
    };
  });

  // file: src/common/urlutil.js
  define('cordova/urlutil', function (require, exports, module) {
    /**
     * For already absolute URLs, returns what is passed in.
     * For relative URLs, converts them to absolute ones.
     */
    exports.makeAbsolute = function makeAbsolute(url) {
      var anchorEl = document.createElement('a');
      anchorEl.href = url;
      return anchorEl.href;
    };
  });

  // file: src/common/utils.js
  define('cordova/utils', function (require, exports, module) {
    var utils = exports;

    /**
     * Defines a property getter / setter for obj[key].
     */
    utils.defineGetterSetter = function (obj, key, getFunc, opt_setFunc) {
      if (Object.defineProperty) {
        var desc = {
          get: getFunc,
          configurable: true,
        };
        if (opt_setFunc) {
          desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
      } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
          obj.__defineSetter__(key, opt_setFunc);
        }
      }
    };

    /**
     * Defines a property getter for obj[key].
     */
    utils.defineGetter = utils.defineGetterSetter;

    utils.arrayIndexOf = function (a, item) {
      if (a.indexOf) {
        return a.indexOf(item);
      }
      var len = a.length;
      for (var i = 0; i < len; ++i) {
        if (a[i] === item) {
          return i;
        }
      }
      return -1;
    };

    /**
     * Returns whether the item was found in the array.
     */
    utils.arrayRemove = function (a, item) {
      var index = utils.arrayIndexOf(a, item);
      if (index !== -1) {
        a.splice(index, 1);
      }
      return index !== -1;
    };

    utils.typeName = function (val) {
      return Object.prototype.toString.call(val).slice(8, -1);
    };

    /**
     * Returns an indication of whether the argument is an array or not
     */
    utils.isArray =
      Array.isArray ||
      function (a) {
        return utils.typeName(a) === 'Array';
      };

    /**
     * Returns an indication of whether the argument is a Date or not
     */
    utils.isDate = function (d) {
      return d instanceof Date;
    };

    /**
     * Does a deep clone of the object.
     */
    utils.clone = function (obj) {
      if (!obj || typeof obj === 'function' || utils.isDate(obj) || typeof obj !== 'object') {
        return obj;
      }

      var retVal, i;

      if (utils.isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
          retVal.push(utils.clone(obj[i]));
        }
        return retVal;
      }

      retVal = {};
      for (i in obj) {
        // https://issues.apache.org/jira/browse/CB-11522 'unknown' type may be returned in
        // custom protocol activation case on Windows Phone 8.1 causing "No such interface supported" exception
        // on cloning.
        if ((!(i in retVal) || retVal[i] !== obj[i]) && typeof obj[i] !== 'undefined' && typeof obj[i] !== 'unknown') {
          // eslint-disable-line valid-typeof
          retVal[i] = utils.clone(obj[i]);
        }
      }
      return retVal;
    };

    /**
     * Returns a wrapped version of the function
     */
    utils.close = function (context, func, params) {
      return function () {
        var args = params || arguments;
        return func.apply(context, args);
      };
    };

    // ------------------------------------------------------------------------------
    function UUIDcreatePart(length) {
      var uuidpart = '';
      for (var i = 0; i < length; i++) {
        var uuidchar = parseInt(Math.random() * 256, 10).toString(16);
        if (uuidchar.length === 1) {
          uuidchar = '0' + uuidchar;
        }
        uuidpart += uuidchar;
      }
      return uuidpart;
    }

    /**
     * Create a UUID
     */
    utils.createUUID = function () {
      return (
        UUIDcreatePart(4) +
        '-' +
        UUIDcreatePart(2) +
        '-' +
        UUIDcreatePart(2) +
        '-' +
        UUIDcreatePart(2) +
        '-' +
        UUIDcreatePart(6)
      );
    };

    /**
     * Extends a child object from a parent object using classical inheritance
     * pattern.
     */
    utils.extend = (function () {
      // proxy used to establish prototype chain
      var F = function () {};
      // extend Child from Parent
      return function (Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
      };
    })();

    /**
     * Alerts a message in any available way: alert or console.log.
     */
    utils.alert = function (msg) {
      if (window.alert) {
        window.alert(msg);
      } else if (console && console.log) {
        console.log(msg);
      }
    };
  });

  window.cordova = require('cordova');
  // file: src/scripts/bootstrap.js

  require('cordova/init');
})();
