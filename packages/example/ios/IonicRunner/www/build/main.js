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

/***/ 190:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_avocado_js__ = __webpack_require__(261);
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
        this.accel = null;
        this.profiling = false;
        this.profileTimeout = null;
        this.profileNumCallsTimeout = null;
        this.profileSamples = null;
    }
    showSplash() {
        let splash = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["k" /* SplashScreen */]();
        splash.show({}, () => {
        });
    }
    showAlert() {
        let modals = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["i" /* Modals */]();
        modals.alert('Stop', 'this is an error', 'Okay');
    }
    showConfirm() {
        let modals = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["i" /* Modals */]();
        modals.confirm('Stop', 'this is an error', 'Okay');
    }
    showPrompt() {
        let modals = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["i" /* Modals */]();
        modals.prompt('Stop', 'this is an error', 'Okay');
    }
    takePicture() {
        let camera = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["b" /* Camera */]();
        camera.getPhoto({
            quality: 90,
            allowEditing: true
        }).then((image) => {
            this.image = image && ('data:image/jpeg;base64,' + image.base64_data);
        });
    }
    getCurrentPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            let geo = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["f" /* Geolocation */]();
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
        let geo = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["f" /* Geolocation */]();
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
            let device = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["c" /* Device */]();
            const info = yield device.getInfo();
            this.zone.run(() => {
                this.deviceInfoJson = JSON.stringify(info, null, 2);
            });
        });
    }
    changeStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["l" /* StatusBar */]();
        statusBar.setStyle({
            style: this.isStatusBarLight ? __WEBPACK_IMPORTED_MODULE_2_avocado_js__["m" /* StatusBarStyle */].Dark : __WEBPACK_IMPORTED_MODULE_2_avocado_js__["m" /* StatusBarStyle */].Light
        }, () => { });
        this.isStatusBarLight = !this.isStatusBarLight;
    }
    hapticsImpact(style = __WEBPACK_IMPORTED_MODULE_2_avocado_js__["h" /* HapticsImpactStyle */].Heavy) {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["g" /* Haptics */]();
        haptics.impact({
            style: style
        });
    }
    hapticsImpactMedium(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2_avocado_js__["h" /* HapticsImpactStyle */].Medium);
    }
    hapticsImpactLight(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2_avocado_js__["h" /* HapticsImpactStyle */].Light);
    }
    hapticsVibrate() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["g" /* Haptics */]();
        haptics.vibrate();
    }
    hapticsSelectionStart() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["g" /* Haptics */]();
        haptics.selectionStart();
    }
    hapticsSelectionChanged() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["g" /* Haptics */]();
        haptics.selectionChanged();
    }
    hapticsSelectionEnd() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["g" /* Haptics */]();
        haptics.selectionEnd();
    }
    browserOpen() {
        let browser = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["a" /* Browser */]();
        browser.open('http://ionicframework.com');
    }
    fileWrite() {
        let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
        try {
            fs.writeFile('secrets/text.txt', "This is a test", __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
        }
        catch (e) {
            console.error('Unable to write file (press mkdir first, silly)', e);
        }
        console.log('Wrote file');
    }
    fileRead() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
            let contents = yield fs.readFile('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
            console.log(contents);
        });
    }
    fileAppend() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
            yield fs.appendFile('secrets/text.txt', "MORE TESTS", __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
            console.log('Appended');
        });
    }
    mkdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
            try {
                let ret = yield fs.mkdir('secrets', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
                console.log('Made dir', ret);
            }
            catch (e) {
                console.error('Unable to make directory', e);
            }
        });
    }
    rmdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
            try {
                let ret = yield fs.rmdir('secrets', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
                console.log('Removed dir', ret);
            }
            catch (e) {
                console.error('Unable to remove directory', e);
            }
        });
    }
    readdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
            try {
                let ret = yield fs.readdir('secrets', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
                console.log('Read dir', ret);
            }
            catch (e) {
                console.error('Unable to read dir', e);
            }
        });
    }
    stat() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["d" /* Filesystem */]();
            try {
                let ret = yield fs.stat('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["e" /* FilesystemDirectory */].Documents);
                console.log('STAT', ret);
            }
            catch (e) {
                console.error('Unable to stat file', e);
            }
        });
    }
    watchAccel() {
        let m = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["j" /* Motion */]();
        m.watchAccel((err, values) => {
            this.zone.run(() => {
                const v = {
                    x: values.x.toFixed(4),
                    y: values.y.toFixed(4),
                    z: values.z.toFixed(4)
                };
                this.accel = v;
            });
        });
    }
    startProfile() {
        this.profiling = true;
        var samples = [];
        var numCalls = 0;
        const pCalls = () => {
            samples.push(numCalls);
            numCalls = 0;
            setTimeout(pCalls, 1000);
        };
        const p = () => {
            this.getDeviceInfo();
            numCalls++;
            this.profileTimeout = setTimeout(p);
        };
        this.profileNumCallsTimeout = setTimeout(pCalls);
        this.profileTimeout = setTimeout(p);
    }
    endProfile() {
        this.profiling = false;
        var avgPerSecond = this.profileSamples.reduce((acc, val) => acc + val) / this.profileSamples.length;
        this.profileSamples = [];
        alert(`Profile: ${avgPerSecond}/second calls (avg)`);
        clearTimeout(this.profileTimeout);
    }
};
HomePage = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
        selector: 'page-home',template:/*ion-inline-start:"/Users/max/git/avocado/packages/example/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Home</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <ion-list>\n    <ion-item>\n      <button (click)="showSplash()" ion-button color="primary">\n        Show Splash\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="showAlert()" ion-button color="primary">\n        Alert\n      </button>\n      <button (click)="showConfirm()" ion-button color="primary">\n        Confirm\n      </button>\n      <button (click)="showPrompt()" ion-button color="primary">\n        Prompt\n      </button>\n    </ion-item>\n    <ion-item>\n      <img [src]="image">\n      <button (click)="takePicture()" ion-button color="primary">\n        Take Picture</button>\n    </ion-item>\n    <!--\n    <ion-item>\n      Profile\n    </ion-item>\n    <ion-item>\n      <button (click)="startProfile()" ion-button color="primary" *ngIf="!profiling">\n        Start Profile\n      </button>\n      <button (click)="endProfile()" ion-button color="primary" *ngIf="profiling">\n        End Profile\n      </button>\n    </ion-item>\n    -->\n    <ion-item>\n      <button (click)="getCurrentPosition()" ion-button color="primary">\n        Geolocation.getCurrentPosition\n      </button>\n      <div>\n        Lat: {{singleCoords.latitude}} Long: {{singleCoords.longitude}}\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="watchPosition()" ion-button color="primary">\n        Geolocation.watchPosition\n      </button>\n      <div>\n        Lat: {{watchCoords.latitude}} Long: {{watchCoords.longitude}}\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="getDeviceInfo()" ion-button>\n        Device Info\n      </button>\n      <div *ngIf="deviceInfoJson">\n        <pre style="height: 200px; overflow: auto">\n{{deviceInfoJson}}\n        </pre>\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="changeStatusBar()" ion-button color="primary">\n        Change StatusBar Style\n      </button>\n    </ion-item>\n    <ion-item>\n      Haptics\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsImpact()" ion-button color="primary">\n        Heavy\n      </button>\n      <button (click)="hapticsImpactMedium()" ion-button color="primary">\n        Medium\n      </button>\n      <button (click)="hapticsImpactLight()" ion-button color="primary">\n        Light \n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsVibrate()" ion-button color="primary">\n        Haptics Vibrate\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsSelectionStart()" ion-button color="primary">\n        Haptics Start\n      </button>\n      <button (click)="hapticsSelectionChanged()" ion-button color="primary">\n        Haptics Changed\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="browserOpen()" ion-button color="primary">\n        Browser Open\n      </button>\n    </ion-item>\n    <ion-item>FS</ion-item>\n    <ion-item>\n      <button (click)="mkdir()" ion-button>\n        mkdir\n      </button>\n      <button (click)="rmdir()" ion-button>\n        rmdir\n      </button>\n      <button (click)="readdir()" ion-button>\n        readdir\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="fileWrite()" ion-button>\n        File Write\n      </button>\n      <button (click)="fileRead()" ion-button>\n        File Read\n      </button>\n      <button (click)="fileAppend()" ion-button>\n        File Append\n      </button>\n      <button (click)="stat()" ion-button>\n        Stat\n      </button>\n    </ion-item>\n    <ion-item>\n      Motion\n    </ion-item>\n    <ion-item>\n      <button (click)="watchAccel()" ion-button>\n        Watch Accel\n      </button>\n      <div *ngIf="accel">\n        <b>x</b>: {{accel.x}} <b>y</b>: {{accel.y}} <b>z</b>: {{accel.z}}\n      </div>\n    </ion-item>\n  </ion-list>\n</ion-content>\n'/*ion-inline-end:"/Users/max/git/avocado/packages/example/src/pages/home/home.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */], __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgZone */]])
], HomePage);

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 193:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(217);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 217:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(260);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(190);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(262);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__ = __webpack_require__(271);
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

/***/ 260:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__pages_home_home__ = __webpack_require__(190);
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
    constructor(platform) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_2__pages_home_home__["a" /* HomePage */];
    }
};
MyApp = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/max/git/avocado/packages/example/src/app/app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"/Users/max/git/avocado/packages/example/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Platform */]])
], MyApp);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 261:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Avocado */
/* unused harmony export Platform */
/* unused harmony export Plugin */
/* unused harmony export AvocadoPlugin */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Browser; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Camera; });
/* unused harmony export Console */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Device; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return Filesystem; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return FilesystemDirectory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return Geolocation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return Haptics; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return HapticsImpactStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return Modals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return Motion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return SplashScreen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return StatusBar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return StatusBarStyle; });
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
    Plugin.prototype.nativeCallback = function (method, options, callbackFunction, callOptions) {
        if (typeof options === 'function') {
            callbackFunction = options;
            options = {};
        }
        return this.native(method, options, 'callback', callbackFunction);
    };
    Plugin.prototype.nativePromise = function (method, options, callOptions) {
        return this.native(method, options, 'promise', null, callOptions);
    };
    /**
     * Call a native plugin method, or a web API fallback.
     *
     * NO CONSOLE LOGS IN THIS METHOD! Can throw our
     * custom console handler into an infinite loop
     */
    Plugin.prototype.native = function (method, options, callbackType, callbackFunction, callOptions) {
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
var Console = /** @class */ (function (_super) {
    __extends(Console, _super);
    function Console() {
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
    Console.prototype.windowLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.originalLog.apply(this.originalLog, args);
    };
    Console = __decorate([
        AvocadoPlugin({
            name: 'Console',
            id: 'com.avocadojs.plugin.console'
        })
    ], Console);
    return Console;
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
        setTimeout(function () { _this.loadCoreModules(); });
    }
    Avocado.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift('Avocado: ');
        this.console && this.console.windowLog(args);
    };
    Avocado.prototype.loadCoreModules = function () {
        this.console = new Console();
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
        window.webkit.messageHandlers.bridge.postMessage(__assign({ type: 'message' }, call));
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
        var storedCall = this.calls[result.callbackId];
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
var Browser = /** @class */ (function (_super) {
    __extends$1(Browser, _super);
    function Browser() {
        return _super.call(this) || this;
    }
    Browser.prototype.open = function (url) {
        this.nativeCallback('open', { url: url });
    };
    Browser = __decorate$1([
        AvocadoPlugin({
            name: 'Browser',
            id: 'com.avocadojs.plugin.browser'
        })
    ], Browser);
    return Browser;
}(Plugin));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Camera = /** @class */ (function (_super) {
    __extends$2(Camera, _super);
    function Camera() {
        return _super.call(this) || this;
    }
    Camera.prototype.getPhoto = function (options) {
        return this.nativePromise('getPhoto', options);
    };
    Camera = __decorate$2([
        AvocadoPlugin({
            name: 'Camera',
            id: 'com.avocadojs.plugin.camera'
        })
    ], Camera);
    return Camera;
}(Plugin));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Device = /** @class */ (function (_super) {
    __extends$3(Device, _super);
    function Device() {
        return _super.call(this) || this;
    }
    Device.prototype.getInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.nativePromise('getInfo', {}, null)];
            });
        });
    };
    Device = __decorate$3([
        AvocadoPlugin({
            name: 'Device',
            id: 'com.avocadojs.plugin.device'
        })
    ], Device);
    return Device;
}(Plugin));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilesystemDirectory;
(function (FilesystemDirectory) {
    FilesystemDirectory["Application"] = "APPLICATION";
    FilesystemDirectory["Documents"] = "DOCUMENTS";
    FilesystemDirectory["Data"] = "DATA";
    FilesystemDirectory["Cache"] = "CACHE";
    FilesystemDirectory["External"] = "EXTERNAL";
    FilesystemDirectory["ExternalStorage"] = "EXTERNAL_STORAGE"; // Android only
})(FilesystemDirectory || (FilesystemDirectory = {}));
var Filesystem = /** @class */ (function (_super) {
    __extends$4(Filesystem, _super);
    function Filesystem() {
        return _super.call(this) || this;
    }
    Filesystem.prototype.writeFile = function (file, data, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('writeFile', {
            file: file,
            data: data,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.appendFile = function (file, data, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('appendFile', {
            file: file,
            data: data,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.readFile = function (file, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('readFile', {
            file: file,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.mkdir = function (path, directory, createIntermediateDirectories) {
        if (createIntermediateDirectories === void 0) { createIntermediateDirectories = false; }
        return this.nativePromise('mkdir', {
            path: path,
            directory: directory,
            createIntermediateDirectories: createIntermediateDirectories
        });
    };
    Filesystem.prototype.rmdir = function (path, directory) {
        return this.nativePromise('rmdir', {
            path: path,
            directory: directory
        });
    };
    Filesystem.prototype.readdir = function (path, directory) {
        return this.nativePromise('readdir', {
            path: path,
            directory: directory
        });
    };
    Filesystem.prototype.stat = function (path, directory) {
        return this.nativePromise('stat', {
            path: path,
            directory: directory
        });
    };
    Filesystem = __decorate$4([
        AvocadoPlugin({
            name: 'Filesystem',
            id: 'com.avocadojs.plugin.fs'
        })
    ], Filesystem);
    return Filesystem;
}(Plugin));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator$1 = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Geolocation = /** @class */ (function (_super) {
    __extends$5(Geolocation, _super);
    function Geolocation() {
        return _super.call(this) || this;
    }
    Geolocation.prototype.doThingWithCallback = function (callback) {
        return this.nativeCallback('doThing', {}, callback);
    };
    Geolocation.prototype.getCurrentPosition = function () {
        return __awaiter$1(this, void 0, void 0, function () {
            return __generator$1(this, function (_a) {
                return [2 /*return*/, this.nativePromise('getCurrentPosition', {
                        someVar: 'yo'
                    }, this.getLocationWeb.bind(this))];
            });
        });
    };
    Geolocation.prototype.watchPosition = function (callback) {
        return this.nativeCallback('watchPosition', {}, callback);
    };
    Geolocation.prototype.getLocationWeb = function () {
        console.log('Geolocation calling web fallback');
        if (navigator.geolocation) {
            return new Promise(function (resolve, reject) {
                navigator.geolocation.getCurrentPosition(function (position) {
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
    };
    Geolocation = __decorate$5([
        AvocadoPlugin({
            name: 'Geolocation',
            id: 'com.avocadojs.plugin.geolocation'
        })
    ], Geolocation);
    return Geolocation;
}(Plugin));

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HapticsImpactStyle;
(function (HapticsImpactStyle) {
    HapticsImpactStyle["Heavy"] = "HEAVY";
    HapticsImpactStyle["Medium"] = "MEDIUM";
    HapticsImpactStyle["Light"] = "LIGHT";
})(HapticsImpactStyle || (HapticsImpactStyle = {}));
var Haptics = /** @class */ (function (_super) {
    __extends$6(Haptics, _super);
    function Haptics() {
        return _super.call(this) || this;
    }
    Haptics.prototype.impact = function (options) {
        this.nativeCallback('impact', options);
    };
    Haptics.prototype.vibrate = function () {
        this.nativeCallback('vibrate');
    };
    Haptics.prototype.selectionStart = function () {
        this.nativeCallback('selectionStart');
    };
    Haptics.prototype.selectionChanged = function () {
        this.nativeCallback('selectionChanged');
    };
    Haptics.prototype.selectionEnd = function () {
        this.nativeCallback('selectionEnd');
    };
    Haptics = __decorate$6([
        AvocadoPlugin({
            name: 'Haptics',
            id: 'com.avocadojs.plugin.haptics'
        })
    ], Haptics);
    return Haptics;
}(Plugin));

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Modals = /** @class */ (function (_super) {
    __extends$7(Modals, _super);
    function Modals() {
        return _super.call(this) || this;
    }
    Modals.prototype.alert = function (title, message, buttonTitle) {
        return this.nativePromise('alert', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals.prototype.prompt = function (title, message, buttonTitle) {
        this.nativePromise('prompt', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals.prototype.confirm = function (title, message, buttonTitle) {
        this.nativePromise('confirm', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals = __decorate$7([
        AvocadoPlugin({
            name: 'Modals',
            id: 'com.avocadojs.plugin.modals'
        })
    ], Modals);
    return Modals;
}(Plugin));

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Motion = /** @class */ (function (_super) {
    __extends$8(Motion, _super);
    function Motion() {
        return _super.call(this) || this;
    }
    Motion.prototype.watchAccel = function (callback) {
        this.nativeCallback('watchAccel', callback);
    };
    Motion = __decorate$8([
        AvocadoPlugin({
            name: 'Motion',
            id: 'com.avocadojs.plugin.motion'
        })
    ], Motion);
    return Motion;
}(Plugin));

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SplashScreen = /** @class */ (function (_super) {
    __extends$9(SplashScreen, _super);
    function SplashScreen() {
        return _super.call(this) || this;
    }
    SplashScreen.prototype.show = function (options, callback) {
        this.nativeCallback('show', options, callback);
    };
    SplashScreen.prototype.hide = function (options, callback) {
        this.nativeCallback('hide', options, callback);
    };
    SplashScreen = __decorate$9([
        AvocadoPlugin({
            name: 'SplashScreen',
            id: 'com.avocadojs.plugin.splashscreen'
        })
    ], SplashScreen);
    return SplashScreen;
}(Plugin));

var __extends$10 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$10 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StatusBarStyle;
(function (StatusBarStyle) {
    StatusBarStyle["Dark"] = "DARK";
    StatusBarStyle["Light"] = "LIGHT";
})(StatusBarStyle || (StatusBarStyle = {}));
var StatusBar = /** @class */ (function (_super) {
    __extends$10(StatusBar, _super);
    function StatusBar() {
        return _super.call(this) || this;
    }
    StatusBar.prototype.setStyle = function (options, callback) {
        this.nativeCallback('setStyle', options, callback);
    };
    StatusBar = __decorate$10([
        AvocadoPlugin({
            name: 'StatusBar',
            id: 'com.avocadojs.plugin.statusbar'
        })
    ], StatusBar);
    return StatusBar;
}(Plugin));




/***/ })

},[193]);
//# sourceMappingURL=main.js.map