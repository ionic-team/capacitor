webpackJsonp([14],{

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
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"../pages/browser/browser.module": [
		271,
		13
	],
	"../pages/camera/camera.module": [
		273,
		12
	],
	"../pages/clipboard/clipboard.module": [
		272,
		11
	],
	"../pages/device/device.module": [
		278,
		10
	],
	"../pages/filesystem/filesystem.module": [
		274,
		9
	],
	"../pages/geolocation/geolocation.module": [
		275,
		8
	],
	"../pages/haptics/haptics.module": [
		276,
		7
	],
	"../pages/keyboard/keyboard.module": [
		277,
		6
	],
	"../pages/local-notifications/local-notifications.module": [
		279,
		5
	],
	"../pages/modals/modals.module": [
		280,
		4
	],
	"../pages/motion/motion.module": [
		282,
		3
	],
	"../pages/network/network.module": [
		281,
		2
	],
	"../pages/splash-screen/splash-screen.module": [
		283,
		1
	],
	"../pages/status-bar/status-bar.module": [
		284,
		0
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return __webpack_require__.e(ids[1]).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = 150;
module.exports = webpackAsyncContext;

/***/ }),

/***/ 192:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(193);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(216);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 216:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(217);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__app_component__ = __webpack_require__(260);
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
            __WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* MyApp */],
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["c" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* MyApp */], {
                preloadModules: true
            }, {
                links: [
                    { loadChildren: '../pages/browser/browser.module#BrowserPageModule', name: 'BrowserPage', segment: 'browser', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/clipboard/clipboard.module#ClipboardPageModule', name: 'ClipboardPage', segment: 'clipboard', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/camera/camera.module#CameraPageModule', name: 'CameraPage', segment: 'camera', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/filesystem/filesystem.module#FilesystemPageModule', name: 'FilesystemPage', segment: 'filesystem', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/geolocation/geolocation.module#GeolocationPageModule', name: 'GeolocationPage', segment: 'geolocation', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/haptics/haptics.module#HapticsPageModule', name: 'HapticsPage', segment: 'haptics', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/keyboard/keyboard.module#KeyboardPageModule', name: 'KeyboardPage', segment: 'keyboard', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/device/device.module#DevicePageModule', name: 'DevicePage', segment: 'device', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/local-notifications/local-notifications.module#LocalNotificationsPageModule', name: 'LocalNotificationsPage', segment: 'local-notifications', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/modals/modals.module#ModalsPageModule', name: 'ModalsPage', segment: 'modals', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/network/network.module#NetworkPageModule', name: 'NetworkPage', segment: 'network', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/motion/motion.module#MotionPageModule', name: 'MotionPage', segment: 'motion', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/splash-screen/splash-screen.module#SplashScreenPageModule', name: 'SplashScreenPage', segment: 'splash-screen', priority: 'low', defaultHistory: [] },
                    { loadChildren: '../pages/status-bar/status-bar.module#StatusBarPageModule', name: 'StatusBarPage', segment: 'status-bar', priority: 'low', defaultHistory: [] }
                ]
            })
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["a" /* IonicApp */]],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* MyApp */]
        ],
        providers: [
            __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__["a" /* StatusBar */],
            __WEBPACK_IMPORTED_MODULE_6__ionic_native_splash_screen__["a" /* SplashScreen */],
            { provide: __WEBPACK_IMPORTED_MODULE_0__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["b" /* IonicErrorHandler */] }
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(98);
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
        this.rootPage = 'BrowserPage';
        this.PLUGINS = [
            { name: 'Browser', page: 'BrowserPage' },
            { name: 'Camera', page: 'CameraPage' },
            { name: 'Clipboard', page: 'ClipboardPage' },
            { name: 'Device', page: 'DevicePage' },
            { name: 'Filesystem', page: 'FilesystemPage' },
            { name: 'Geolocation', page: 'GeolocationPage' },
            { name: 'Haptics', page: 'HapticsPage' },
            { name: 'Keyboard', page: 'KeyboardPage' },
            { name: 'LocalNotifications', page: 'LocalNotificationsPage' },
            { name: 'Modals', page: 'ModalsPage' },
            { name: 'Motion', page: 'MotionPage' },
            { name: 'Network', page: 'NetworkPage' },
            { name: 'SplashScreen', page: 'SplashScreenPage' },
            { name: 'StatusBar', page: 'StatusBarPage' }
        ];
    }
    openPlugin(plugin) {
        this.nav.setRoot(plugin.page);
    }
};
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_8" /* ViewChild */])(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Nav */]),
    __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Nav */])
], MyApp.prototype, "nav", void 0);
MyApp = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/max/git/avocado/example/src/app/app.html"*/'<ion-menu [content]="content">\n  <ion-header>\n    <ion-toolbar>\n      <ion-title>Plugins</ion-title>\n    </ion-toolbar>\n  </ion-header>\n\n  <ion-content>\n    <ion-list>\n      <button menuClose ion-item *ngFor="let p of PLUGINS" (click)="openPlugin(p)">\n        {{p.name}}\n      </button>\n    </ion-list>\n  </ion-content>\n\n</ion-menu>\n\n<!-- Disable swipe-to-go-back because it\'s poor UX to combine STGB with side menus -->\n<ion-nav [root]="rootPage" #content swipeBackEnabled="false"></ion-nav>'/*ion-inline-end:"/Users/max/git/avocado/example/src/app/app.html"*/
    }),
    __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */]])
], MyApp);

//# sourceMappingURL=app.component.js.map

/***/ })

},[192]);
//# sourceMappingURL=main.js.map