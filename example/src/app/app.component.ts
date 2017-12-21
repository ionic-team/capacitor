import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Nav } from 'ionic-angular';

import { HomePage } from '../pages/home/home';

import { Plugins } from '@avocadojs/core';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = 'AdminPage';

  PLUGINS = [
    { name: 'Admin', page: 'AdminPage' },
    { name: 'Accessibility', page: 'AccessibilityPage' },
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
    { name: 'Photos', page: 'PhotosPage' },
    { name: 'SplashScreen', page: 'SplashScreenPage' },
    { name: 'StatusBar', page: 'StatusBarPage' }
  ]

  constructor(platform: Platform) {
    Plugins.AppState.addListener('pluginError', (err: any, info: any) => {
      console.error('There was a serious error with a plugin', err, info);
    });

    Plugins.AppState.addListener('appStateChanged', (err: any, state: any) => {
      console.log('App state changed', state);
    });
  }

  openPlugin(plugin: any) {
    this.nav.setRoot(plugin.page);
  }
}
