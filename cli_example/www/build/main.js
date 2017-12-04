webpackJsonp([0],{

/***/ 109:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 109;

/***/ }),

/***/ 150:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 150;

/***/ }),

/***/ 194:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__plugins__ = __webpack_require__(272);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_avocado_js__ = __webpack_require__(195);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




let HomePage = class HomePage {
    constructor(navCtrl, zone) {
        this.navCtrl = navCtrl;
        this.zone = zone;
        this.singleCoords = { lat: 0, lng: 0 };
        this.watchCoords = { lat: 0, lng: 0 };
        this.isStatusBarLight = true;
    }
    /*
    takePicture() {
      let camera = new CameraPlugin();
      camera.getPicture().then((image) => {
        console.log('Got picture callback');
        this.image = image && image.data;
      });
    }
    */
    getCurrentPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            let geo = new __WEBPACK_IMPORTED_MODULE_2__plugins__["c" /* GeolocationPlugin */]();
            try {
                const coordinates = yield geo.getCurrentPosition();
                console.log('Current', coordinates);
                this.zone.run(() => {
                    this.singleCoords = coordinates.coords;
                });
            }
            catch (e) {
                alert('WebView geo error');
                console.error(e);
            }
        });
    }
    watchPosition() {
        let geo = new __WEBPACK_IMPORTED_MODULE_2__plugins__["c" /* GeolocationPlugin */]();
        try {
            const wait = geo.watchPosition((err, position) => {
                console.log('Watch', position);
                this.zone.run(() => {
                    this.watchCoords = position.coords;
                });
            });
        }
        catch (e) {
            alert('WebView geo error');
            console.error(e);
        }
    }
    getDeviceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let device = new __WEBPACK_IMPORTED_MODULE_2__plugins__["b" /* DevicePlugin */]();
            const info = yield device.getInfo();
            this.zone.run(() => {
                this.deviceInfoJson = JSON.stringify(info, null, 2);
                console.log('Device info');
                console.log(info);
            });
        });
    }
    changeStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2__plugins__["f" /* StatusBarPlugin */]();
        statusBar.setStyle({
            style: this.isStatusBarLight ? __WEBPACK_IMPORTED_MODULE_2__plugins__["g" /* StatusBarStyle */].Dark : __WEBPACK_IMPORTED_MODULE_2__plugins__["g" /* StatusBarStyle */].Light
        }, () => { });
        this.isStatusBarLight = !this.isStatusBarLight;
    }
    hapticsImpact(style = __WEBPACK_IMPORTED_MODULE_2__plugins__["d" /* HapticsImpactStyle */].Heavy) {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__plugins__["e" /* HapticsPlugin */]();
        haptics.impact({
            style: style
        });
    }
    hapticsImpactMedium(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2__plugins__["d" /* HapticsImpactStyle */].Medium);
    }
    hapticsImpactLight(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2__plugins__["d" /* HapticsImpactStyle */].Light);
    }
    hapticsVibrate() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__plugins__["e" /* HapticsPlugin */]();
        haptics.vibrate();
    }
    hapticsSelectionStart() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__plugins__["e" /* HapticsPlugin */]();
        haptics.selectionStart();
    }
    hapticsSelectionChanged() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__plugins__["e" /* HapticsPlugin */]();
        haptics.selectionChanged();
    }
    hapticsSelectionEnd() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__plugins__["e" /* HapticsPlugin */]();
        haptics.selectionEnd();
    }
    browserOpen() {
        let browser = new __WEBPACK_IMPORTED_MODULE_2__plugins__["a" /* BrowserPlugin */]();
        browser.open('http://ionicframework.com');
    }
    fileWrite() {
        let fs = new __WEBPACK_IMPORTED_MODULE_3_avocado_js__["b" /* FSPlugin */]();
        fs.writeFile('text.txt', "This is a test");
        console.log('Wrote file');
    }
    fileRead() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_3_avocado_js__["b" /* FSPlugin */]();
            let contents = yield fs.readFile('text.txt');
            console.log(contents);
        });
    }
};
HomePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
        selector: 'page-home',template:/*ion-inline-start:"/Users/max/git/avocado/packages/example/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Home</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <ion-list>\n    <!--\n    <ion-item>\n      <img [src]="image">\n      <button (click)="takePicture()" ion-button color="primary">\n        Take Picture</button>\n    </ion-item>\n  -->\n    <ion-item>\n      <button (click)="getCurrentPosition()" ion-button color="primary">\n        Geolocation.getCurrentPosition\n      </button>\n      <div>\n        Lat: {{singleCoords.latitude}} Long: {{singleCoords.longitude}}\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="watchPosition()" ion-button color="primary">\n        Geolocation.watchPosition\n      </button>\n      <div>\n        Lat: {{watchCoords.latitude}} Long: {{watchCoords.longitude}}\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="getDeviceInfo()" ion-button>\n        Device Info\n      </button>\n      <div *ngIf="deviceInfoJson">\n        <pre style="height: 200px; overflow: auto">\n{{deviceInfoJson}}\n        </pre>\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="changeStatusBar()" ion-button color="primary">\n        Change StatusBar Style\n      </button>\n    </ion-item>\n    <ion-item>\n      Haptics\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsImpact()" ion-button color="primary">\n        Heavy\n      </button>\n      <button (click)="hapticsImpactMedium()" ion-button color="primary">\n        Medium\n      </button>\n      <button (click)="hapticsImpactLight()" ion-button color="primary">\n        Light \n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsVibrate()" ion-button color="primary">\n        Haptics Vibrate\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsSelectionStart()" ion-button color="primary">\n        Haptics Start\n      </button>\n      <button (click)="hapticsSelectionChanged()" ion-button color="primary">\n        Haptics Changed\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="browserOpen()" ion-button color="primary">\n        Browser Open\n      </button>\n    </ion-item>\n    <ion-item>FS</ion-item>\n    <ion-item>\n      <button (click)="fileWrite()" ion-button>\n        File Write\n      </button>\n      <button (click)="fileRead()" ion-button>\n        File Read\n      </button>\n    </ion-item>\n  </ion-list>\n</ion-content>\n'/*ion-inline-end:"/Users/max/git/avocado/packages/example/src/pages/home/home.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */], __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgZone */]])
], HomePage);

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 195:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Avocado */
/* unused harmony export Platform */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Plugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AvocadoPlugin; });
/* unused harmony export ConsolePlugin */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return FSPlugin; });
var Platform = /** @class */ (function () {
    function Platform() {
    }
    return Platform;
}());

/**
 * Base class for all 3rd party plugins.
 */
var Plugin = /** @class */ (function () {
    function Plugin() {
        this.avocado = Avocado.instance();
        this.avocado.registerPlugin(this);
    }
    Plugin.prototype.nativeCallback = function (method, options, callbackFunction, webFallback) {
        return this.native(method, options, 'callback', callbackFunction);
    };
    Plugin.prototype.nativePromise = function (method, options, webFallback) {
        return this.native(method, options, 'promise', null);
    };
    /**
     * Call a native plugin method, or a web API fallback.
     *
     * NO CONSOLE LOGS IN THIS METHOD! Can throw our
     * custom console handler into an infinite loop
     */
    Plugin.prototype.native = function (method, options, callbackType, callbackFunction) {
        var d = this.constructor.getPluginInfo();
        // If avocado is running in a browser environment, call our
        // web fallback
        /*
        if(this.avocado.isBrowser()) {
          if(webFallback) {
            return webFallback(options);
          } else {
            throw new Error('Tried calling a native plugin method in the browser but no web fallback is available.');
          }
        }
        */
        // Avocado is running in a non-sandbox browser environment, call
        // the native code underneath
        return this.avocado.toNative({
            pluginId: d.id,
            methodName: method,
            options: options,
            callbackType: callbackType
        }, {
            callbackFunction: callbackFunction
        });
    };
    return Plugin;
}());
/**
 * Decorator for AvocadoPlugin's
 */
function AvocadoPlugin(config) {
    return function (cls) {
        cls['_avocadoPlugin'] = Object.assign({}, config);
        cls['getPluginInfo'] = function () {
            return cls['_avocadoPlugin'];
        };
        return cls;
    };
}

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConsolePlugin = /** @class */ (function (_super) {
    __extends(ConsolePlugin, _super);
    function ConsolePlugin() {
        var _this = _super.call(this) || this;
        _this.queue = [];
        _this.originalLog = window.console.log;
        window.console.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            //const str = args.map(a => a.toString()).join(' ');
            _this.queue.push(['log'].concat(args));
            _this.originalLog.apply(console, args);
        };
        var syncQueue = function () {
            var queue = _this.queue.slice();
            while (queue.length) {
                var logMessage = queue.shift();
                var level = logMessage[0];
                var message = logMessage.slice(1);
                _this.nativeCallback('log', { level: level, message: message });
            }
            setTimeout(syncQueue, 100);
        };
        setTimeout(syncQueue);
        return _this;
    }
    ConsolePlugin.prototype.windowLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.originalLog.apply(this.originalLog, args);
    };
    ConsolePlugin = __decorate([
        AvocadoPlugin({
            name: 'Console',
            id: 'com.avocadojs.plugin.console'
        })
    ], ConsolePlugin);
    return ConsolePlugin;
}(Plugin));

var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * Main class for interacting with the Avocado runtime.
 */
var Avocado = /** @class */ (function () {
    function Avocado() {
        // Load console plugin first to avoid race conditions
        var _this = this;
        // Storage of calls for associating w/ native callback later
        this.calls = {};
        this.callbackIdCount = 0;
        this.platform = new Platform();
        setTimeout(function () { _this.loadCorePlugins(); });
    }
    Avocado.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift('Avocado: ');
        this.console && this.console.windowLog(args);
    };
    Avocado.prototype.loadCorePlugins = function () {
        this.console = new ConsolePlugin();
    };
    Avocado.prototype.registerPlugin = function (plugin) {
        var info = plugin.constructor.getPluginInfo();
        this.log('Registering plugin', info);
    };
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    Avocado.prototype.toNative = function (call, caller) {
        var ret;
        var callbackId = call.pluginId + ++this.callbackIdCount;
        call.callbackId = callbackId;
        switch (call.callbackType) {
            case undefined:
                ret = this._toNativePromise(call, caller);
            case 'callback':
                if (typeof caller.callbackFunction !== 'function') {
                    caller.callbackFunction = function () { };
                }
                ret = this._toNativeCallback(call, caller);
                break;
            case 'promise':
                ret = this._toNativePromise(call, caller);
            case 'observable':
                break;
        }
        //this.log('To native', call);
        // Send this call to the native layer
        window.webkit.messageHandlers.avocado.postMessage(__assign({ type: 'message' }, call));
        return ret;
    };
    Avocado.prototype._toNativeCallback = function (call, caller) {
        this._saveCallback(call, caller.callbackFunction);
    };
    Avocado.prototype._toNativePromise = function (call, caller) {
        var promiseCall = {};
        var promise = new Promise(function (resolve, reject) {
            promiseCall['$resolve'] = resolve;
            promiseCall['$reject'] = reject;
        });
        promiseCall['$promise'] = promise;
        this._saveCallback(call, promiseCall);
        return promise;
    };
    Avocado.prototype._saveCallback = function (call, callbackHandler) {
        call.callbackId = call.callbackId;
        this.calls[call.callbackId] = {
            call: call,
            callbackHandler: callbackHandler
        };
    };
    /**
     * Process a response from the native layer.
     */
    Avocado.prototype.fromNative = function (result) {
        console.log('From Native', result);
        var storedCall = this.calls[result.callbackId];
        console.log('Stored call', storedCall);
        var call = storedCall.call, callbackHandler = storedCall.callbackHandler;
        this._fromNativeCallback(result, storedCall);
    };
    Avocado.prototype._fromNativeCallback = function (result, storedCall) {
        var call = storedCall.call, callbackHandler = storedCall.callbackHandler;
        switch (storedCall.call.callbackType) {
            case 'promise': {
                if (result.success === false) {
                    callbackHandler.$reject(result.error);
                }
                else {
                    callbackHandler.$resolve(result.data);
                }
                break;
            }
            case 'callback': {
                if (typeof callbackHandler == 'function') {
                    result.success ? callbackHandler(null, result.data) : callbackHandler(result.error, null);
                }
            }
        }
    };
    /**
     * @return whether or not we're running in a browser sandbox environment
     * with no acces to native functionality (progressive web, desktop browser, etc).
     */
    Avocado.prototype.isBrowser = function () {
        // TODO: Make this generic
        return !!!window.webkit;
    };
    /**
     * @return the instance of Avocado
     */
    Avocado.instance = function () {
        if (window.avocado) {
            return window.avocado;
        }
        return window.avocado = new Avocado();
    };
    return Avocado;
}());

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Directory;
(function (Directory) {
    Directory["Application"] = "APPLICATION";
    Directory["Documents"] = "DOCUMENTS";
    Directory["DocumentsSynced"] = "DOCUMENTS_SYNCED";
    Directory["Data"] = "DATA";
    Directory["DataSynced"] = "DATA_SYNCED";
    Directory["Cache"] = "CACHE";
})(Directory || (Directory = {}));

var FSPlugin = /** @class */ (function (_super) {
    __extends$1(FSPlugin, _super);
    function FSPlugin() {
        return _super.call(this) || this;
    }
    FSPlugin.prototype.writeFile = function (file, data, options) {
        return this.nativePromise('writeFile', {
            directory: options && options.directory || Directory.Documents,
            file: file,
            data: data
        });
    };
    FSPlugin.prototype.readFile = function (file, options) {
        return this.nativePromise('readFile', {
            directory: options && options.directory || Directory.Documents,
            file: file
        });
    };
    FSPlugin = __decorate$1([
        AvocadoPlugin({
            name: 'FS',
            id: 'com.avocadojs.plugin.fs'
        })
    ], FSPlugin);
    return FSPlugin;
}(Plugin));




/***/ }),

/***/ 196:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(197);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(220);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 220:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(263);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(190);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__ = __webpack_require__(193);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};







let AppModule = class AppModule {
};
AppModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
            __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */],
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */], {}, {
                links: []
            })
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* IonicApp */]],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
            __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */]
        ],
        providers: [
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__["a" /* StatusBar */],
            __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__["a" /* SplashScreen */],
            { provide: __WEBPACK_IMPORTED_MODULE_0__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicErrorHandler */] }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 263:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(190);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(193);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(194);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





let MyApp = class MyApp {
    constructor(platform, statusBar, splashScreen) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */];
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });
    }
};
MyApp = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/max/git/avocado/packages/example/src/app/app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"/Users/max/git/avocado/packages/example/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]])
], MyApp);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 272:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BrowserPlugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return HapticsImpactStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return HapticsPlugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return StatusBarStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return StatusBarPlugin; });
/* unused harmony export CameraPlugin */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return DevicePlugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return GeolocationPlugin; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_avocado_js__ = __webpack_require__(195);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

let BrowserPlugin = class BrowserPlugin extends __WEBPACK_IMPORTED_MODULE_0_avocado_js__["c" /* Plugin */] {
    constructor() { super(); }
    open(url) {
        this.nativeCallback('open', { url });
    }
};
BrowserPlugin = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0_avocado_js__["a" /* AvocadoPlugin */])({
        name: 'Browser',
        id: 'com.avocadojs.plugin.browser'
    }),
    __metadata("design:paramtypes", [])
], BrowserPlugin);

var HapticsImpactStyle;
(function (HapticsImpactStyle) {
    HapticsImpactStyle["Heavy"] = "HEAVY";
    HapticsImpactStyle["Medium"] = "MEDIUM";
    HapticsImpactStyle["Light"] = "LIGHT";
})(HapticsImpactStyle || (HapticsImpactStyle = {}));
;
let HapticsPlugin = class HapticsPlugin extends __WEBPACK_IMPORTED_MODULE_0_avocado_js__["c" /* Plugin */] {
    constructor() { super(); }
    impact(options) {
        this.nativeCallback('impact', options);
    }
    vibrate() {
        this.nativeCallback('vibrate');
    }
    selectionStart() {
        this.nativeCallback('selectionStart');
    }
    selectionChanged() {
        this.nativeCallback('selectionChanged');
    }
    selectionEnd() {
        this.nativeCallback('selectionEnd');
    }
};
HapticsPlugin = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0_avocado_js__["a" /* AvocadoPlugin */])({
        name: 'Haptics',
        id: 'com.avocadojs.plugin.haptics'
    }),
    __metadata("design:paramtypes", [])
], HapticsPlugin);

var StatusBarStyle;
(function (StatusBarStyle) {
    StatusBarStyle["Dark"] = "DARK";
    StatusBarStyle["Light"] = "LIGHT";
})(StatusBarStyle || (StatusBarStyle = {}));
;
let StatusBarPlugin = class StatusBarPlugin extends __WEBPACK_IMPORTED_MODULE_0_avocado_js__["c" /* Plugin */] {
    constructor() { super(); }
    setStyle(options, callback) {
        this.nativeCallback('setStyle', options, callback);
    }
};
StatusBarPlugin = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0_avocado_js__["a" /* AvocadoPlugin */])({
        name: 'StatusBar',
        id: 'com.avocadojs.plugin.statusbar'
    }),
    __metadata("design:paramtypes", [])
], StatusBarPlugin);

let CameraPlugin = class CameraPlugin extends __WEBPACK_IMPORTED_MODULE_0_avocado_js__["c" /* Plugin */] {
    constructor() {
        super();
    }
    doThingWithCallback(callback) {
        return this.nativeCallback('doThing', {}, callback);
    }
    getPicture() {
        return this.nativePromise('getPicture', {
            width: 800,
            height: 600
        }, this.getPictureWeb.bind(this));
    }
    getPictureWeb() {
        console.log('Camera calling web fallback');
        return Promise.resolve({
            data: "data:image/gif;base64,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"
        });
    }
};
CameraPlugin = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0_avocado_js__["a" /* AvocadoPlugin */])({
        name: 'Camera',
        id: 'camera',
        platforms: ['ios', 'android', 'web', 'electron']
    }),
    __metadata("design:paramtypes", [])
], CameraPlugin);

let DevicePlugin = class DevicePlugin extends __WEBPACK_IMPORTED_MODULE_0_avocado_js__["c" /* Plugin */] {
    constructor() {
        super();
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.nativePromise('getInfo', {}, null);
        });
    }
};
DevicePlugin = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0_avocado_js__["a" /* AvocadoPlugin */])({
        name: 'Device',
        id: 'com.avocadojs.plugin.device'
    }),
    __metadata("design:paramtypes", [])
], DevicePlugin);

let GeolocationPlugin = class GeolocationPlugin extends __WEBPACK_IMPORTED_MODULE_0_avocado_js__["c" /* Plugin */] {
    constructor() {
        super();
    }
    doThingWithCallback(callback) {
        return this.nativeCallback('doThing', {}, callback);
    }
    getCurrentPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.nativePromise('getCurrentPosition', {
                someVar: 'yo'
            }, this.getLocationWeb.bind(this));
        });
    }
    watchPosition(callback) {
        return this.nativeCallback('watchPosition', {}, callback);
    }
    getLocationWeb() {
        console.log('Geolocation calling web fallback');
        if (navigator.geolocation) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition((position) => {
                    resolve(position.coords);
                    console.log(position);
                });
            });
        }
        else {
            return Promise.reject({
                err: new Error('Geolocation is not supported by this browser.')
            });
        }
    }
};
GeolocationPlugin = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0_avocado_js__["a" /* AvocadoPlugin */])({
        name: 'Geolocation',
        id: 'com.avocadojs.plugin.geolocation'
    }),
    __metadata("design:paramtypes", [])
], GeolocationPlugin);

//# sourceMappingURL=plugins.js.map

/***/ })

},[196]);
//# sourceMappingURL=main.js.map