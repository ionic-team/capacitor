import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Nav } from 'ionic-angular';

import { Plugins } from '@capacitor/core';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = 'AppPage';

  PLUGINS = [
    { name: 'App', page: 'AppPage' },
    { name: 'Accessibility', page: 'AccessibilityPage' },
    { name: 'Background', page: 'BackgroundPage' },
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
    { name: 'Nav', page: 'NavPage' },
    { name: 'Network', page: 'NetworkPage' },
    { name: 'Permissions', page: 'PermissionsPage' },
    { name: 'Photos', page: 'PhotosPage' },
    { name: 'Share', page: 'SharePage' },
    { name: 'SplashScreen', page: 'SplashScreenPage' },
    { name: 'Storage', page: 'StoragePage' },
    { name: 'StatusBar', page: 'StatusBarPage' },
    { name: 'Toast', page: 'ToastPage' }
  ]

  constructor(platform: Platform) {
    Plugins.SplashScreen.hide();
    /*
    Plugins.App.addListener('pluginError', (err: any, info: any) => {
      console.error('There was a serious error with a plugin', err, info);
    });
    */

    Plugins.App.addListener('appStateChange', (state: any) => {
      console.log('App state changed', state);
    });

    Plugins.App.addListener('appUrlOpen', (data: any) => {
      alert('APP URL OPEN: ' +  data.url);
    });

    Plugins.App.addListener('appRestoredResult', (data: any) => {
      alert('Got restored result');
      console.log('Restored result:', data);
    });

    this.getLaunchUrl();
  }

  async getLaunchUrl() {
    const ret = await Plugins.App.getLaunchUrl();
    if(ret && ret.url) {
      alert('App opened with URL: ' + ret.url);
    }
    console.log('Launch url: ', ret);
  }

  openPlugin(plugin: any) {
    this.nav.setRoot(plugin.page);
  }
}
