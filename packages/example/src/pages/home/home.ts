import { Component, NgZone } from '@angular/core';

import { NavController } from 'ionic-angular';

import {
  Geolocation,
  Device,
  Filesystem,
  FilesystemDirectory,
  StatusBar,
  StatusBarStyle,
  Haptics,
  HapticsImpactStyle,
  Browser,
  Motion
} from 'avocado-js';

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
  accel = null

  constructor(public navCtrl: NavController, public zone: NgZone) {
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

  async getCurrentPosition() {
    let geo = new Geolocation();

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
    let geo = new Geolocation();

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
    let device = new Device();
    const info = await device.getInfo()
    this.zone.run(() => {
      this.deviceInfoJson = JSON.stringify(info, null, 2);
      console.log('Device info');
      console.log(info);
    });
  }

  changeStatusBar() {
    let statusBar = new StatusBar();
    statusBar.setStyle({
      style: this.isStatusBarLight ? StatusBarStyle.Dark : StatusBarStyle.Light
    }, () => {});
    this.isStatusBarLight = !this.isStatusBarLight;
  }

  hapticsImpact(style = HapticsImpactStyle.Heavy) {
    let haptics = new Haptics()
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
    let haptics = new Haptics()
    haptics.vibrate();
  }

  hapticsSelectionStart() {
    let haptics = new Haptics()
    haptics.selectionStart();
  }

  hapticsSelectionChanged() {
    let haptics = new Haptics()
    haptics.selectionChanged();
  }

  hapticsSelectionEnd() {
    let haptics = new Haptics()
    haptics.selectionEnd();
  }

  browserOpen() {
    let browser = new Browser()
    browser.open('http://ionicframework.com');
  }

  fileWrite() {
    let fs = new Filesystem()
    try {
      fs.writeFile('secrets/text.txt', "This is a test", FilesystemDirectory.Documents)
    } catch(e) {
      console.error('Unable to write file (press mkdir first, silly)', e);
    }
    console.log('Wrote file');
  }

  async fileRead() {
    let fs = new Filesystem()
    let contents = await fs.readFile('secrets/text.txt', FilesystemDirectory.Documents);
    console.log(contents);
  }

  async fileAppend() {
    let fs = new Filesystem()
    await fs.appendFile('secrets/text.txt', "MORE TESTS", FilesystemDirectory.Documents);
    console.log('Appended');
  }

  async mkdir() {
    let fs = new Filesystem()
    try {
      let ret = await fs.mkdir('secrets', FilesystemDirectory.Documents);
      console.log('Made dir', ret);
    } catch(e) {
      console.error('Unable to make directory', e);
    }
  }

  async rmdir() {
    let fs = new Filesystem()
    try {
      let ret = await fs.rmdir('secrets', FilesystemDirectory.Documents);
      console.log('Removed dir', ret);
    } catch(e) {
      console.error('Unable to remove directory', e);
    }
  }

  async readdir() {
    let fs = new Filesystem()
    try {
      let ret = await fs.readdir('secrets', FilesystemDirectory.Documents);
      console.log('Read dir', ret);
    } catch(e) {
      console.error('Unable to read dir', e);
    }
  }

  async stat() {
    let fs = new Filesystem()
    try {
      let ret = await fs.stat('secrets/text.txt', FilesystemDirectory.Documents);
      console.log('STAT', ret);
    } catch(e) {
      console.error('Unable to stat file', e);
    }
  }

  watchAccel() {
    let m = new Motion();
    m.watchAccel((err, values) => {
      this.zone.run(() => {
        const v = {
          x: values.x.toFixed(4),
          y: values.y.toFixed(4),
          z: values.z.toFixed(4)
        }
        this.accel = v;
      });
    });
  }
}
