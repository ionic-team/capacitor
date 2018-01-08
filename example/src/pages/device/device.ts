import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@capacitor/core';

/**
 * Generated class for the DevicePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-device',
  templateUrl: 'device.html',
})
export class DevicePage {
  deviceInfoJson: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevicePage');
  }

  async getDeviceInfo() {
    const info = await Plugins.Device.getInfo()
    console.log('Got device info', info);
    this.zone.run(() => {
      this.deviceInfoJson = JSON.stringify(info, null, 2);
    });
  }
}
