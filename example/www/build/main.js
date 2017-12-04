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
throw new Error("Cannot find module \"avocado-js\"");
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
        let splash = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["SplashScreen"]();
        splash.hide();
        let network = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Network"]();
        network.onStatusChange((err, status) => {
            console.log("Network status changed", status);
        });
        let t = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Test"]();
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
        let s = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["SplashScreen"]();
        s.show({
            autoHide: false
        });
        setTimeout(() => {
            s.hide();
        }, 6000);
    }
    showSplashAutoFade() {
        let s = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["SplashScreen"]();
        s.show({
            showDuration: 2000,
            autoHide: true
        });
    }
    scheduleLocalNotification() {
        let ln = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["LocalNotifications"]();
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
        let c = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Clipboard"]();
        c.set({
            string: "Hello, Moto"
        });
    }
    clipboardGetString() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Clipboard"]();
            let str = yield c.get({
                type: "string"
            });
            console.log('Got string from clipboard:', str);
        });
    }
    clipboardSetURL() {
        let c = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Clipboard"]();
        c.set({
            url: "http://google.com/"
        });
    }
    clipboardGetURL() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Clipboard"]();
            let url = c.get({
                type: "url"
            });
            console.log("Get URL from clipboard", url);
        });
    }
    clipboardSetImage() {
        let c = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Clipboard"]();
        console.log('Setting image', this.base64Image);
        c.set({
            image: this.base64Image
        });
    }
    clipboardGetImage() {
        return __awaiter(this, void 0, void 0, function* () {
            let c = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Clipboard"]();
            const image = yield c.get({
                type: "image"
            });
            console.log('Got image', image);
        });
    }
    showAlert() {
        return __awaiter(this, void 0, void 0, function* () {
            let modals = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Modals"]();
            let alertRet = yield modals.alert('Stop', 'this is an error');
            console.log('Alert ret', alertRet);
        });
    }
    showConfirm() {
        return __awaiter(this, void 0, void 0, function* () {
            let modals = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Modals"]();
            let confirmRet = yield modals.confirm('Confirm', 'Are you sure you\'d like to press the red button?');
            console.log('Confirm ret', confirmRet);
        });
    }
    showPrompt() {
        return __awaiter(this, void 0, void 0, function* () {
            let modals = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Modals"]();
            let promptRet = yield modals.prompt('Hello', 'What\'s your name?');
            console.log('Prompt ret', promptRet);
        });
    }
    takePicture() {
        let camera = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Camera"]();
        camera.getPhoto({
            quality: 90,
            allowEditing: true
        }).then((image) => {
            this.image = image && ('data:image/jpeg;base64,' + image.base64_data);
        });
    }
    getCurrentPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            let geo = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Geolocation"]();
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
        let geo = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Geolocation"]();
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
            let device = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Device"]();
            const info = yield device.getInfo();
            this.zone.run(() => {
                this.deviceInfoJson = JSON.stringify(info, null, 2);
            });
        });
    }
    changeStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["StatusBar"]();
        statusBar.setStyle({
            style: this.isStatusBarLight ? __WEBPACK_IMPORTED_MODULE_2_avocado_js__["StatusBarStyle"].Dark : __WEBPACK_IMPORTED_MODULE_2_avocado_js__["StatusBarStyle"].Light
        }, () => { });
        this.isStatusBarLight = !this.isStatusBarLight;
    }
    hideStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["StatusBar"]();
        statusBar.hide();
    }
    showStatusBar() {
        let statusBar = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["StatusBar"]();
        statusBar.show();
    }
    hapticsImpact(style = __WEBPACK_IMPORTED_MODULE_2_avocado_js__["HapticsImpactStyle"].Heavy) {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Haptics"]();
        haptics.impact({
            style: style
        });
    }
    hapticsImpactMedium(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2_avocado_js__["HapticsImpactStyle"].Medium);
    }
    hapticsImpactLight(style) {
        this.hapticsImpact(__WEBPACK_IMPORTED_MODULE_2_avocado_js__["HapticsImpactStyle"].Light);
    }
    hapticsVibrate() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Haptics"]();
        haptics.vibrate();
    }
    hapticsSelectionStart() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Haptics"]();
        haptics.selectionStart();
    }
    hapticsSelectionChanged() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Haptics"]();
        haptics.selectionChanged();
    }
    hapticsSelectionEnd() {
        let haptics = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Haptics"]();
        haptics.selectionEnd();
    }
    browserOpen() {
        let browser = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Browser"]();
        browser.open('http://ionicframework.com');
    }
    fileWrite() {
        let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
        try {
            fs.writeFile('secrets/text.txt', "This is a test", __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
        }
        catch (e) {
            console.error('Unable to write file (press mkdir first, silly)', e);
        }
        console.log('Wrote file');
    }
    fileRead() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            let contents = yield fs.readFile('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
            console.log(contents);
        });
    }
    fileAppend() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            yield fs.appendFile('secrets/text.txt', "MORE TESTS", __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
            console.log('Appended');
        });
    }
    fileDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            yield fs.deleteFile('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
            console.log('Deleted');
        });
    }
    mkdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            try {
                let ret = yield fs.mkdir('secrets', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
                console.log('Made dir', ret);
            }
            catch (e) {
                console.error('Unable to make directory', e);
            }
        });
    }
    rmdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            try {
                let ret = yield fs.rmdir('secrets', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
                console.log('Removed dir', ret);
            }
            catch (e) {
                console.error('Unable to remove directory', e);
            }
        });
    }
    readdir() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            try {
                let ret = yield fs.readdir('secrets', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
                console.log('Read dir', ret);
            }
            catch (e) {
                console.error('Unable to read dir', e);
            }
        });
    }
    stat() {
        return __awaiter(this, void 0, void 0, function* () {
            let fs = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Filesystem"]();
            try {
                let ret = yield fs.stat('secrets/text.txt', __WEBPACK_IMPORTED_MODULE_2_avocado_js__["FilesystemDirectory"].Documents);
                console.log('STAT', ret);
            }
            catch (e) {
                console.error('Unable to stat file', e);
            }
        });
    }
    watchAccel() {
        let m = new __WEBPACK_IMPORTED_MODULE_2_avocado_js__["Motion"]();
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(261);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__ = __webpack_require__(270);
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
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/max/git/avocado/example/src/app/app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"/Users/max/git/avocado/example/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Platform */]])
], MyApp);

//# sourceMappingURL=app.component.js.map

/***/ })

},[193]);
//# sourceMappingURL=main.js.map