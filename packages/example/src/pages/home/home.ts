import { Component, NgZone } from '@angular/core';

import { NavController } from 'ionic-angular';

import {
  CameraPlugin,
  GeolocationPlugin,
  DevicePlugin,
  StatusBarPlugin,
  StatusBarStyle,
  HapticsPlugin,
  HapticsImpactStyle
} from '../../plugins';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  image: string;
  singleCoords = { lat: 0, lng: 0 }
  watchCoords = { lat: 0, lng: 0 }
  deviceInfoJson: string;
  isStatusBarLight = true

  constructor(public navCtrl: NavController, public zone: NgZone) {}

  /*
  takePicture() {
    let camera = new CameraPlugin();
    camera.getPicture().then((image) => {
      console.log('Got picture callback');
      this.image = image && image.data;
    });
  }
  */

  async getCurrentPosition() {
    let geo = new GeolocationPlugin();

    try {
      const coordinates = await geo.getCurrentPosition()
      console.log('Current', coordinates);
      this.zone.run(() => {
        this.singleCoords = coordinates.coords;
      });
    } catch(e) {
      alert('WebView geo error');
      console.error(e);
    }
  }

  watchPosition() {
    let geo = new GeolocationPlugin();

    try {
      const wait = geo.watchPosition((err, position) => {
        console.log('Watch', position);
        this.zone.run(() => {
          this.watchCoords = position.coords;
        });
      })
    } catch(e) {
      alert('WebView geo error');
      console.error(e);
    }
  }

  async getDeviceInfo() {
    let device = new DevicePlugin();
    const info = await device.getInfo()
    this.zone.run(() => {
      this.deviceInfoJson = JSON.stringify(info, null, 2);
      console.log('Device info');
      console.log(info);
    });
  }

  changeStatusBar() {
    let statusBar = new StatusBarPlugin();
    statusBar.setStyle({
      style: this.isStatusBarLight ? StatusBarStyle.Dark : StatusBarStyle.Light
    }, () => {});
    this.isStatusBarLight = !this.isStatusBarLight;
  }

  hapticsImpact(style = HapticsImpactStyle.Heavy) {
    let haptics = new HapticsPlugin()
    haptics.impact({
      style: style
    });
  }

  hapticsImpactMedium(style) {
    this.hapticsImpact(HapticsImpactStyle.Medium);
  }

  hapticsImpactLight(style) {
    this.hapticsImpact(HapticsImpactStyle.Light);
  }

  hapticsVibrate() {
    let haptics = new HapticsPlugin()
    haptics.vibrate();
  }
}
