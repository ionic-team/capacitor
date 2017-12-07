webpackJsonp([0],{

/***/ 11:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Plugin; });
/* harmony export (immutable) */ __webpack_exports__["a"] = NativePlugin;
/**
 * Base class for all 3rd party plugins.
 */
var Plugin = /** @class */ (function () {
    function Plugin() {
        window.avocado[this.config.name] = this;
    }
    Plugin.prototype.nativeCallback = function (methodName, options, callback) {
        if (typeof options === 'function') {
            // 2nd arg was a function
            // so it's the callback, not options
            callback = options;
            options = {};
        }
        window.avocado.toNative(this.config.id, methodName, options, {
            callback: callback
        });
    };
    Plugin.prototype.nativePromise = function (methodName, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            window.avocado.toNative(_this.config.id, methodName, options, {
                resolve: resolve,
                reject: reject
            });
        });
    };
    Object.defineProperty(Plugin.prototype, "config", {
        get: function () {
            return this.constructor._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plugin.prototype, "isNative", {
        get: function () {
            return window.avocado.isNative;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plugin.prototype, "platform", {
        get: function () {
            return window.avocado.platform;
        },
        enumerable: true,
        configurable: true
    });
    return Plugin;
}());

/**
 * Plugin Decorator
 */
function NativePlugin(config) {
    return function (cls) {
        cls._config = Object.assign({}, config);
        return cls;
    };
}
//# sourceMappingURL=plugin.js.map

/***/ }),

/***/ 110:
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
webpackEmptyAsyncContext.id = 110;

/***/ }),

/***/ 151:
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
webpackEmptyAsyncContext.id = 151;

/***/ }),

/***/ 191:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__ = __webpack_require__(262);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__ = __webpack_require__(26);
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
    constructor(navCtrl, zone, sanitizer) {
        this.navCtrl = navCtrl;
        this.zone = zone;
        this.sanitizer = sanitizer;
        this.singleCoords = {
            latitude: 0,
            longitude: 0
        };
        this.watchCoords = {
            latitude: 0,
            longitude: 0
        };
        this.isStatusBarLight = true;
        this.accel = null;
        this.profiling = false;
        this.profileTimeout = null;
        this.profileNumCallsTimeout = null;
        this.profileSamples = null;
        let splash = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["n" /* SplashScreen */]();
        splash.hide();
        let network = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["m" /* Network */]();
        network.onStatusChange((err, status) => {
            console.log("Network status changed", status);
        });
        let t = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["q" /* Test */]();
        t.test();
        this.doStuff();
    }
    doStuff() {
        return __awaiter(this, void 0, void 0, function* () {
            const toDataURL = url => fetch(url)
                .then(response => response.blob())
                .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.base64Image = reader.result.replace('data:;base64,', '');
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }));
            toDataURL('assets/ionitron.png');
        });
    }
    showSplash() {
        let s = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["n" /* SplashScreen */]();
        s.show({
            autoHide: false
        });
        setTimeout(() => {
            s.hide();
        }, 6000);
    }
    showSplashAutoFade() {
        let s = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["n" /* SplashScreen */]();
        s.show({
            showDuration: 2000,
            autoHide: true
        });
    }
    scheduleLocalNotification() {
        let ln = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["j" /* LocalNotifications */]();
        ln.schedule({
            title: 'Get 20% off!',
            body: 'Swipe to learn more',
            identifier: 'special-deal',
            scheduleAt: {
                hour: 23,
                minute: 26
            }
        }).then((r) => {
            console.log('Scheduled notification', r);
        });
    }
    clipboardSetString() {
        let c = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["c" /* Clipboard */]();
        c.set({
            string: "Hello, Moto"
        });
    }
    clipboardGetString() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["c" /* Clipboard */]();
            let str = yield c.get({
                type: "string"
            });
            console.log('Got string from clipboard:', str);
        });
    }
    clipboardSetURL() {
        let c = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["c" /* Clipboard */]();
        c.set({
            url: "http://google.com/"
        });
    }
    clipboardGetURL() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["c" /* Clipboard */]();
            let url = c.get({
                type: "url"
            });
            console.log("Get URL from clipboard", url);
        });
    }
    clipboardSetImage() {
        let c = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["c" /* Clipboard */]();
        console.log('Setting image', this.base64Image);
        c.set({
            image: this.base64Image
        });
    }
    clipboardGetImage() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["c" /* Clipboard */]();
            const image = yield c.get({
                type: "image"
            });
            console.log('Got image', image);
        });
    }
    showAlert() {
        return __awaiter(this, void 0, void 0, function* () {
            let modals = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["k" /* Modals */]();
            let alertRet = yield modals.alert('Stop', 'this is an error');
            console.log('Alert ret', alertRet);
        });
    }
    showConfirm() {
        return __awaiter(this, void 0, void 0, function* () {
            let modals = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["k" /* Modals */]();
            let confirmRet = yield modals.confirm('Confirm', 'Are you sure you\'d like to press the red button?');
            console.log('Confirm ret', confirmRet);
        });
    }
    showPrompt() {
        return __awaiter(this, void 0, void 0, function* () {
            let modals = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["k" /* Modals */]();
            let promptRet = yield modals.prompt('Hello', 'What\'s your name?');
            console.log('Prompt ret', promptRet);
        });
    }
    takePicture() {
        let camera = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["b" /* Camera */]();
        camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: 'base64'
        }).then((image) => {
            const b64 = this.sanitizer.bypassSecurityTrustResourceUrl(image && ('data:image/jpeg;base64,' + image.base64_data));
            this.image = b64;
        });
    }
    getCurrentPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            let geo = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["g" /* Geolocation */]();
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
        let geo = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["g" /* Geolocation */]();
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
            let device = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["d" /* Device */]();
            const info = yield device.getInfo();
            this.zone.run(() => {
                this.deviceInfoJson = JSON.stringify(info, null, 2);
            });
        });
    }
    changeStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["o" /* StatusBar */]();
        statusBar.setStyle({
            style: this.isStatusBarLight ? __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["p" /* StatusBarStyle */].Dark : __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["p" /* StatusBarStyle */].Light
        }, () => { });
        this.isStatusBarLight = !this.isStatusBarLight;
    }
    hideStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["o" /* StatusBar */]();
        statusBar.hide();
    }
    showStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["o" /* StatusBar */]();
        statusBar.show();
    }
    hapticsImpact(style = __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["i" /* HapticsImpactStyle */].Heavy) {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["h" /* Haptics */]();
        haptics.impact({
            style: style
        });
    }
    hapticsImpactMedium(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["i" /* HapticsImpactStyle */].Medium);
    }
    hapticsImpactLight(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["i" /* HapticsImpactStyle */].Light);
    }
    hapticsVibrate() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["h" /* Haptics */]();
        haptics.vibrate();
    }
    hapticsSelectionStart() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["h" /* Haptics */]();
        haptics.selectionStart();
    }
    hapticsSelectionChanged() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["h" /* Haptics */]();
        haptics.selectionChanged();
    }
    hapticsSelectionEnd() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["h" /* Haptics */]();
        haptics.selectionEnd();
    }
    browserOpen() {
        let browser = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["a" /* Browser */]();
        browser.open('http://ionicframework.com');
    }
    fileWrite() {
        let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
        try {
            fs.writeFile('secrets/text.txt', "This is a test", __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
        }
        catch (e) {
            console.error('Unable to write file (press mkdir first, silly)', e);
        }
        console.log('Wrote file');
    }
    fileRead() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            let contents = yield fs.readFile('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
            console.log(contents);
        });
    }
    fileAppend() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            yield fs.appendFile('secrets/text.txt', "MORE TESTS", __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
            console.log('Appended');
        });
    }
    fileDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            yield fs.deleteFile('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
            console.log('Deleted');
        });
    }
    mkdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            try {
                let ret = yield fs.mkdir('secrets', __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
                console.log('Made dir', ret);
            }
            catch (e) {
                console.error('Unable to make directory', e);
            }
        });
    }
    rmdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            try {
                let ret = yield fs.rmdir('secrets', __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
                console.log('Removed dir', ret);
            }
            catch (e) {
                console.error('Unable to remove directory', e);
            }
        });
    }
    readdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            try {
                let ret = yield fs.readdir('secrets', __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
                console.log('Read dir', ret);
            }
            catch (e) {
                console.error('Unable to read dir', e);
            }
        });
    }
    stat() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["e" /* Filesystem */]();
            try {
                let ret = yield fs.stat('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["f" /* FilesystemDirectory */].Documents);
                console.log('STAT', ret);
            }
            catch (e) {
                console.error('Unable to stat file', e);
            }
        });
    }
    watchAccel() {
        let m = new __WEBPACK_IMPORTED_MODULE_2__avocadojs_core__["l" /* Motion */]();
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
        selector: 'page-home',template:/*ion-inline-start:"/Users/max/git/avocado/example/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>Home</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n  <ion-list>\n    <ion-item>FS</ion-item>\n    <ion-item>\n      <button (click)="mkdir()" ion-button>\n        mkdir\n      </button>\n      <button (click)="rmdir()" ion-button>\n        rmdir\n      </button>\n      <button (click)="readdir()" ion-button>\n        readdir\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="fileWrite()" ion-button>\n        Write\n      </button>\n      <button (click)="fileRead()" ion-button>\n        Read\n      </button>\n      <button (click)="fileAppend()" ion-button>\n        Append\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="fileDelete()" ion-button>\n        Delete\n      </button>\n      <button (click)="stat()" ion-button>\n        Stat\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="showSplash()" ion-button color="primary">\n        Splash Show\n      </button>\n      <button (click)="showSplashAutoFade()" ion-button color="primary">\n        Splash Auto Fade\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="showAlert()" ion-button color="primary">\n        Alert\n      </button>\n      <button (click)="showConfirm()" ion-button color="primary">\n        Confirm\n      </button>\n      <button (click)="showPrompt()" ion-button color="primary">\n        Prompt\n      </button>\n    </ion-item>\n    <ion-item>\n      <img [src]="image">\n      <button (click)="takePicture()" ion-button color="primary">\n        Take Picture</button>\n    </ion-item>\n    <!--\n    <ion-item>\n      Profile\n    </ion-item>\n    <ion-item>\n      <button (click)="startProfile()" ion-button color="primary" *ngIf="!profiling">\n        Start Profile\n      </button>\n      <button (click)="endProfile()" ion-button color="primary" *ngIf="profiling">\n        End Profile\n      </button>\n    </ion-item>\n    -->\n    <ion-item>\n      <button (click)="clipboardSetString()" ion-button color="primary">\n        Copy String\n      </button>\n      <button (click)="clipboardSetURL()" ion-button color="primary">\n        Copy URL\n      </button>\n      <button (click)="clipboardSetImage()" ion-button color="primary">\n        Copy Image\n      </button>\n      <div>\n      </div>\n      <button (click)="clipboardGetString()" ion-button color="primary">\n        Paste String\n      </button>\n      <button (click)="clipboardGetURL()" ion-button color="primary">\n        Paste URL\n      </button>\n      <button (click)="clipboardGetImage()" ion-button color="primary">\n        Paste Image\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="getCurrentPosition()" ion-button color="primary">\n        Geolocation.getCurrentPosition\n      </button>\n      <div>\n        Lat: {{singleCoords.latitude}} Long: {{singleCoords.longitude}}\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="watchPosition()" ion-button color="primary">\n        Geolocation.watchPosition\n      </button>\n      <div>\n        Lat: {{watchCoords.latitude}} Long: {{watchCoords.longitude}}\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="scheduleLocalNotification()" ion-button>\n        Schedule Local Notification\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="getDeviceInfo()" ion-button>\n        Device Info\n      </button>\n      <div *ngIf="deviceInfoJson">\n        <pre style="height: 200px; overflow: auto">\n{{deviceInfoJson}}\n        </pre>\n      </div>\n    </ion-item>\n    <ion-item>\n      <button (click)="changeStatusBar()" ion-button color="primary">\n        Change StatusBar Style\n      </button>\n      <button (click)="showStatusBar()" ion-button color="primary">\n        Show\n      </button>\n      <button (click)="hideStatusBar()" ion-button color="primary">\n        Hide\n      </button>\n    </ion-item>\n    <ion-item>\n      Haptics\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsImpact()" ion-button color="primary">\n        Heavy\n      </button>\n      <button (click)="hapticsImpactMedium()" ion-button color="primary">\n        Medium\n      </button>\n      <button (click)="hapticsImpactLight()" ion-button color="primary">\n        Light \n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsVibrate()" ion-button color="primary">\n        Haptics Vibrate\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="hapticsSelectionStart()" ion-button color="primary">\n        Haptics Start\n      </button>\n      <button (click)="hapticsSelectionChanged()" ion-button color="primary">\n        Haptics Changed\n      </button>\n    </ion-item>\n    <ion-item>\n      <button (click)="browserOpen()" ion-button color="primary">\n        Browser Open\n      </button>\n    </ion-item>\n    <ion-item>\n      Motion\n    </ion-item>\n    <ion-item>\n      <button (click)="watchAccel()" ion-button>\n        Watch Accel\n      </button>\n      <div *ngIf="accel">\n        <b>x</b>: {{accel.x}} <b>y</b>: {{accel.y}} <b>z</b>: {{accel.z}}\n      </div>\n    </ion-item>\n  </ion-list>\n</ion-content>\n'/*ion-inline-end:"/Users/max/git/avocado/example/src/pages/home/home.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */], __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgZone */], __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["c" /* DomSanitizer */]])
], HomePage);

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 194:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(218);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 218:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(261);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(191);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(279);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__ = __webpack_require__(288);
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

/***/ 261:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__pages_home_home__ = __webpack_require__(191);
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
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/max/git/avocado/example/src/app/app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"/Users/max/git/avocado/example/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Platform */]])
], MyApp);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 262:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__avocado__ = __webpack_require__(263);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__avocado___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__avocado__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__plugin__ = __webpack_require__(11);
/* unused harmony reexport Plugin */
/* unused harmony reexport NativePlugin */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__plugins_index__ = __webpack_require__(264);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["b"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["c"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["d"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["e"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["f"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["g"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "h", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["h"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "i", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["i"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "j", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["j"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "k", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["k"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "l", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["l"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "m", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["m"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "n", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["n"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "o", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["o"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "p", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["p"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "q", function() { return __WEBPACK_IMPORTED_MODULE_2__plugins_index__["q"]; });
// always import avocado so that it's placed on window



//# sourceMappingURL=index.js.map

/***/ }),

/***/ 263:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {(function (win) {
    if (win.avocado) {
        return;
    }
    // keep a collection of callbacks for native response data
    var calls = {};
    // keep a counter of callback ids
    var callbackIdCount = 0;
    // create global
    var avocado = win.avocado = {
        isNative: false,
        platform: 'browser'
    };
    // create the postToNative() fn if needed
    var postToNative;
    if (win.androidBridge) {
        // android platform
        postToNative = function androidBridge(data) {
            win.androidBridge.postMessage(JSON.stringify(data));
        };
        avocado.isNative = true;
        avocado.platform = 'android';
    }
    else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
        // ios platform
        postToNative = function iosBridge(data) {
            data.type = 'message';
            win.webkit.messageHandlers.bridge.postMessage(data);
        };
        avocado.isNative = true;
        avocado.platform = 'ios';
    }
    // patch window.console and store original console fns
    var orgConsole = {};
    Object.keys(win.console).forEach(function (level) {
        if (typeof win.console[level] === 'function') {
            // loop through all the console functions and keep references to the original
            orgConsole[level] = win.console[level];
            win.console[level] = function avocadoConsole() {
                var msgs = Array.prototype.slice.call(arguments);
                // console log to browser
                orgConsole[level].apply(win.console, msgs);
                if (avocado.isNative) {
                    // send log to native to print
                    try {
                        // convert all args to strings
                        msgs = msgs.map(function (arg) {
                            if (typeof arg === 'object') {
                                try {
                                    arg = JSON.stringify(arg);
                                }
                                catch (e) { }
                            }
                            // convert to string
                            return arg + '';
                        });
                        avocado.toNative('com.avocadojs.plugin.console', 'log', {
                            level: level,
                            message: msgs.join(' ')
                        });
                    }
                    catch (e) {
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
                var callbackId = '-1';
                if (storedCallback && (typeof storedCallback.callback === 'function' || typeof storedCallback.resolve === 'function')) {
                    // store the call for later lookup
                    callbackId = ++callbackIdCount + '';
                    calls[callbackId] = storedCallback;
                }
                // post the call data to native
                postToNative({
                    callbackId: callbackId,
                    pluginId: pluginId,
                    methodName: methodName,
                    options: options || {}
                });
            }
            else {
                orgConsole.warn.call(win.console, "browser implementation unavailable for: " + pluginId);
            }
        }
        catch (e) {
            orgConsole.error.call(win.console, e);
        }
    };
    /**
     * Process a response from the native layer.
     */
    avocado.fromNative = function fromNative(result) {
        // get the stored call, if it exists
        try {
            var storedCall = calls[result.callbackId];
            if (storedCall) {
                // looks like we've got a stored call
                if (typeof storedCall.callback === 'function') {
                    // callback
                    if (result.success) {
                        storedCall.callback(null, result.data);
                    }
                    else {
                        storedCall.callback(result.error, null);
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
                    delete calls[result.callbackId];
                }
            }
            else if (!result.success && result.error) {
                // no stored callback, but if there was an error let's log it
                orgConsole.warn.call(win.console, result.error);
            }
        }
        catch (e) {
            orgConsole.error.call(win.console, e);
        }
        // always delete to prevent memory leaks
        // overkill but we're not sure what apps will do with this data
        delete result.data;
        delete result.error;
    };
})((typeof window !== 'undefined' ? window : global));
//# sourceMappingURL=avocado.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(50)))

/***/ }),

/***/ 264:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__browser__ = __webpack_require__(265);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__browser__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__camera__ = __webpack_require__(266);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__camera__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__clipboard__ = __webpack_require__(267);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_2__clipboard__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__device__ = __webpack_require__(268);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_3__device__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__fs__ = __webpack_require__(269);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return __WEBPACK_IMPORTED_MODULE_4__fs__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return __WEBPACK_IMPORTED_MODULE_4__fs__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__geolocation__ = __webpack_require__(270);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return __WEBPACK_IMPORTED_MODULE_5__geolocation__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__haptics__ = __webpack_require__(271);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return __WEBPACK_IMPORTED_MODULE_6__haptics__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return __WEBPACK_IMPORTED_MODULE_6__haptics__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__local_notifications__ = __webpack_require__(272);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return __WEBPACK_IMPORTED_MODULE_7__local_notifications__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__modals__ = __webpack_require__(273);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return __WEBPACK_IMPORTED_MODULE_8__modals__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__motion__ = __webpack_require__(274);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return __WEBPACK_IMPORTED_MODULE_9__motion__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__network__ = __webpack_require__(275);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return __WEBPACK_IMPORTED_MODULE_10__network__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__splashscreen__ = __webpack_require__(276);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return __WEBPACK_IMPORTED_MODULE_11__splashscreen__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__statusbar__ = __webpack_require__(277);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return __WEBPACK_IMPORTED_MODULE_12__statusbar__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return __WEBPACK_IMPORTED_MODULE_12__statusbar__["b"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__test__ = __webpack_require__(278);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return __WEBPACK_IMPORTED_MODULE_13__test__["a"]; });














//# sourceMappingURL=index.js.map

/***/ }),

/***/ 265:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Browser; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Browser = /** @class */ (function (_super) {
    __extends(Browser, _super);
    function Browser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Browser.prototype.open = function (url) {
        if (this.isNative) {
            this.nativeCallback('open', { url: url });
        }
        window.open(url);
    };
    Browser = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Browser',
            id: 'com.avocadojs.plugin.browser'
        })
    ], Browser);
    return Browser;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=browser.js.map

/***/ }),

/***/ 266:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Camera; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Camera = /** @class */ (function (_super) {
    __extends(Camera, _super);
    function Camera() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Camera.prototype.getPhoto = function (options) {
        return this.nativePromise('getPhoto', options);
    };
    Camera = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Camera',
            id: 'com.avocadojs.plugin.camera'
        })
    ], Camera);
    return Camera;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=camera.js.map

/***/ }),

/***/ 267:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Clipboard; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Clipboard = /** @class */ (function (_super) {
    __extends(Clipboard, _super);
    function Clipboard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Clipboard.prototype.set = function (options) {
        return this.nativePromise('set', options);
    };
    Clipboard.prototype.get = function (options) {
        return this.nativePromise('get', options);
    };
    Clipboard = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Clipboard',
            id: 'com.avocadojs.plugin.clipboard'
        })
    ], Clipboard);
    return Clipboard;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=clipboard.js.map

/***/ }),

/***/ 268:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Device; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Device = /** @class */ (function (_super) {
    __extends(Device, _super);
    function Device() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Device.prototype.getInfo = function () {
        if (this.isNative) {
            return this.nativePromise('getInfo');
        }
        return Promise.resolve({
            model: navigator.userAgent,
            platform: 'browser',
            uuid: '',
            version: navigator.userAgent,
            manufacturer: navigator.userAgent,
            isVirtual: false,
            serial: ''
        });
    };
    Device = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Device',
            id: 'com.avocadojs.plugin.device'
        })
    ], Device);
    return Device;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=device.js.map

/***/ }),

/***/ 269:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return FilesystemDirectory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Filesystem; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    __extends(Filesystem, _super);
    function Filesystem() {
        return _super !== null && _super.apply(this, arguments) || this;
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
    Filesystem.prototype.deleteFile = function (file, directory) {
        return this.nativePromise('deleteFile', {
            file: file,
            directory: directory
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
    Filesystem = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Filesystem',
            id: 'com.avocadojs.plugin.filesystem'
        })
    ], Filesystem);
    return Filesystem;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=fs.js.map

/***/ }),

/***/ 270:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Geolocation; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Geolocation = /** @class */ (function (_super) {
    __extends(Geolocation, _super);
    function Geolocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Geolocation.prototype.getCurrentPosition = function () {
        if (this.isNative) {
            return this.nativePromise('getCurrentPosition');
        }
        if (navigator.geolocation) {
            return new Promise(function (resolve) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    resolve(position);
                });
            });
        }
        return Promise.reject({
            err: new Error("Geolocation is not supported by this browser.")
        });
    };
    Geolocation.prototype.watchPosition = function (callback) {
        if (this.isNative) {
            this.nativeCallback('watchPosition', callback);
        }
        else if (navigator.geolocation) {
            var successCallback = function (position) {
                callback(null, position);
            };
            var errorCallback = function (error) {
                callback(error, null);
            };
            navigator.geolocation.watchPosition(successCallback, errorCallback);
        }
        else {
            console.warn("Geolocation is not supported by this browser.");
        }
    };
    Geolocation = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Geolocation',
            id: 'com.avocadojs.plugin.geolocation'
        })
    ], Geolocation);
    return Geolocation;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=geolocation.js.map

/***/ }),

/***/ 271:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Haptics; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return HapticsImpactStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Haptics = /** @class */ (function (_super) {
    __extends(Haptics, _super);
    function Haptics() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Haptics.prototype.impact = function (options) {
        this.nativeCallback('impact', options);
    };
    Haptics.prototype.vibrate = function (options) {
        if (options === void 0) { options = {}; }
        this.nativeCallback('vibrate', options);
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
    Haptics = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Haptics',
            id: 'com.avocadojs.plugin.haptics'
        })
    ], Haptics);
    return Haptics;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

var HapticsImpactStyle;
(function (HapticsImpactStyle) {
    HapticsImpactStyle["Heavy"] = "HEAVY";
    HapticsImpactStyle["Medium"] = "MEDIUM";
    HapticsImpactStyle["Light"] = "LIGHT";
})(HapticsImpactStyle || (HapticsImpactStyle = {}));
//# sourceMappingURL=haptics.js.map

/***/ }),

/***/ 272:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LocalNotifications; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var LocalNotifications = /** @class */ (function (_super) {
    __extends(LocalNotifications, _super);
    function LocalNotifications() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalNotifications.prototype.schedule = function (notification) {
        return this.nativePromise('schedule', notification);
    };
    LocalNotifications = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'LocalNotifications',
            id: 'com.avocadojs.plugin.localnotifications'
        })
    ], LocalNotifications);
    return LocalNotifications;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=local-notifications.js.map

/***/ }),

/***/ 273:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Modals; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Modals = /** @class */ (function (_super) {
    __extends(Modals, _super);
    function Modals() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Modals.prototype.alert = function (title, message, buttonTitle) {
        return this.nativePromise('alert', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals.prototype.prompt = function (title, message, okButtonTitle, cancelButtonTitle, inputPlaceholder) {
        return this.nativePromise('prompt', {
            title: title,
            message: message,
            okButtonTitle: okButtonTitle,
            cancelButtonTitle: cancelButtonTitle,
            inputPlaceholder: inputPlaceholder
        });
    };
    Modals.prototype.confirm = function (title, message, okButtonTitle, cancelButtonTitle) {
        return this.nativePromise('confirm', {
            title: title,
            message: message,
            okButtonTitle: okButtonTitle,
            cancelButtonTitle: cancelButtonTitle
        });
    };
    Modals = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Modals',
            id: 'com.avocadojs.plugin.modals'
        })
    ], Modals);
    return Modals;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=modals.js.map

/***/ }),

/***/ 274:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Motion; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Motion = /** @class */ (function (_super) {
    __extends(Motion, _super);
    function Motion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Motion.prototype.watchAccel = function (callback) {
        this.nativeCallback('watchAccel', callback);
    };
    Motion = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Motion',
            id: 'com.avocadojs.plugin.motion'
        })
    ], Motion);
    return Motion;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=motion.js.map

/***/ }),

/***/ 275:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Network; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Network = /** @class */ (function (_super) {
    __extends(Network, _super);
    function Network() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Network.prototype.onStatusChange = function (callback) {
        this.nativeCallback('onStatusChange', callback);
    };
    Network = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Network',
            id: 'com.avocadojs.plugin.network'
        })
    ], Network);
    return Network;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=network.js.map

/***/ }),

/***/ 276:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SplashScreen; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var SplashScreen = /** @class */ (function (_super) {
    __extends(SplashScreen, _super);
    function SplashScreen() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SplashScreen.prototype.show = function (options, callback) {
        this.nativeCallback('show', options, callback);
    };
    SplashScreen.prototype.hide = function (options, callback) {
        this.nativeCallback('hide', options, callback);
    };
    SplashScreen = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'SplashScreen',
            id: 'com.avocadojs.plugin.splashscreen'
        })
    ], SplashScreen);
    return SplashScreen;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=splashscreen.js.map

/***/ }),

/***/ 277:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StatusBar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return StatusBarStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var StatusBar = /** @class */ (function (_super) {
    __extends(StatusBar, _super);
    function StatusBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StatusBar.prototype.setStyle = function (options, callback) {
        return this.nativeCallback('setStyle', options, callback);
    };
    StatusBar.prototype.show = function () {
        return this.nativePromise('show');
    };
    StatusBar.prototype.hide = function () {
        return this.nativePromise('hide');
    };
    StatusBar = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'StatusBar',
            id: 'com.avocadojs.plugin.statusbar'
        })
    ], StatusBar);
    return StatusBar;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

var StatusBarStyle;
(function (StatusBarStyle) {
    StatusBarStyle["Dark"] = "DARK";
    StatusBarStyle["Light"] = "LIGHT";
})(StatusBarStyle || (StatusBarStyle = {}));
//# sourceMappingURL=statusbar.js.map

/***/ }),

/***/ 278:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Test; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__plugin__ = __webpack_require__(11);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Test = /** @class */ (function (_super) {
    __extends(Test, _super);
    function Test() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Test.prototype.test = function () {
        this.nativePromise('test', {});
    };
    Test = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__plugin__["a" /* NativePlugin */])({
            name: 'Test',
            id: 'com.avocadojs.plugin.test'
        })
    ], Test);
    return Test;
}(__WEBPACK_IMPORTED_MODULE_0__plugin__["b" /* Plugin */]));

//# sourceMappingURL=test.js.map

/***/ })

},[194]);
//# sourceMappingURL=main.js.map