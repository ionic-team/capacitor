import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Camera
} from '@avocadojs/core';

/**
 * Generated class for the CameraPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {
  image: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }


  takePicture() {
    let camera = new Camera();
    camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'base64'
    }).then((image) => {
      this.image = image && ('data:image/jpeg;base64,' + image.base64_data);
    });
  }

}
