import { Component, NgZone } from '@angular/core';

import { NavController } from 'ionic-angular';

import {
  Browser,
  Camera,
  Clipboard,
  Device,
  Filesystem,
  FilesystemDirectory,
  Geolocation,
  Haptics,
  HapticsImpactStyle,
  LocalNotifications,
  Modals,
  Motion,
  Network,
  SplashScreen,
  StatusBar,
  StatusBarStyle
} from 'avocado-js';
import { toBase64String } from '@angular/compiler/src/output/source_map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  base64Image: string;
  image: string;
  singleCoords = {
    latitude: 0,
    longitude: 0
  };
  watchCoords = {
    latitude: 0,
    longitude: 0
  };
  deviceInfoJson: string;
  isStatusBarLight = true
  accel = null
  profiling = false;
  profileTimeout = null;
  profileNumCallsTimeout = null;
  profileSamples = null;

  constructor(public navCtrl: NavController, public zone: NgZone) {
    let network = new Network();
    network.onStatusChange((err, status) => {
      console.log("Network status changed", status);
    });

    this.doStuff();
  }

  async doStuff() {
    const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        this.base64Image = reader.result.replace('data:;base64,', '');
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))

    toDataURL('assets/ionitron.png');
  }

  showSplash() {
    let s = new SplashScreen();
    s.show();
    setTimeout(() => {
      s.hide();
    }, 3000);
  }

  scheduleLocalNotification() {
    let ln = new LocalNotifications();
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
    let c = new Clipboard();
    c.set({
      string: "Hello, Moto"
    });
  }

  async clipboardGetString() {
    let c = new Clipboard();
    let str = await c.get({
      type: "string"
    });
    console.log('Got string from clipboard:', str);
  }

  clipboardSetURL() {
    let c = new Clipboard();
    c.set({
      url: "http://google.com/"
    });
  }

  async clipboardGetURL() {
    let c = new Clipboard();
    let url = c.get({
      type: "url"
    });
    console.log("Get URL from clipboard", url);
  }

  clipboardSetImage () {
    let c = new Clipboard();
    console.log('Setting image', this.base64Image);
    c.set({
      image: this.base64Image
    });
  }

  async clipboardGetImage() {
    let c = new Clipboard();
    const image = await c.get({
      type: "image"
    });
    console.log('Got image', image);
  }

  showAlert() {
    let modals = new Modals()
    modals.alert('Stop', 'this is an error', 'Okay');
  }

  showConfirm() {
    let modals = new Modals()
    modals.confirm('Stop', 'this is an error', 'Okay');
  }

  showPrompt() {
    let modals = new Modals()
    modals.prompt('Stop', 'this is an error', 'Okay');
  }

  takePicture() {
    let camera = new Camera();
    camera.getPhoto({
      quality: 90,
      allowEditing: true
    }).then((image) => {
      this.image = image && ('data:image/jpeg;base64,' + image.base64_data);
    });
  }

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
}
