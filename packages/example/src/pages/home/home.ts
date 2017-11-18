import { Component, NgZone } from '@angular/core';

import { NavController } from 'ionic-angular';

import { CameraPlugin, GeolocationPlugin } from '../../plugins';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  image: string;
  coordinates: Object;

  constructor(public navCtrl: NavController, public zone: NgZone) {
    /*
    let camera = new CameraPlugin();

    camera.doThingWithCallback((err, data) => {
      console.log('Did thing with callback');
    })

    camera.getPicture().then((image) => {
      console.log('Got picture callback');
      this.image = image && image.data;
    });
    */

    this.coordinates = {x:null, y:null};
  }

  takePicture() {
    let camera = new CameraPlugin();
    camera.getPicture().then((image) => {
      console.log('Got picture callback');
      this.image = image && image.data;
    });
  }

  getCoordinates() {
    let geo = new GeolocationPlugin();
    geo.getLocation().then((coordinates) => {
      alert(coordinates);
      console.log(coordinates);
      this.zone.run(() => {
        this.coordinates = coordinates;
      });
    }, (err) => {
      alert('WebView geo error');
      console.error(err);
    });
  }
}
