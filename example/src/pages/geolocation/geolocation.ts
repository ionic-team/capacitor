import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  CallbackID
} from '@capacitor/core';

/**
 * Generated class for the GeolocationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-geolocation',
  templateUrl: 'geolocation.html',
})
export class GeolocationPage {
  singleCoords = {
    latitude: 0,
    longitude: 0
  };
  watchCoords = {
    latitude: 0,
    longitude: 0
  };

  watchId: CallbackID;

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GeolocationPage');
  }

  async requestPermissions() {
    const permResult = await Plugins.Geolocation.requestPermissions();
    console.log('Perm request result: ', permResult);
  }

  async getCurrentPosition() {
    try {
      const coordinates = await Plugins.Geolocation.getCurrentPosition()
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
    try {
      this.watchId = Plugins.Geolocation.watchPosition({}, (position, err) => {
        console.log('Watch', position);
        this.zone.run(() => {
          this.watchCoords = position.coords;
        });
      })

      console.log('Got watch', this.watchId);
    } catch(e) {
      alert('WebView geo error');
      console.error(e);
    }
  }

  clearWatch() {
    if (this.watchId != null) {
      Plugins.Geolocation.clearWatch({ id: this.watchId });
    }
  }
}
