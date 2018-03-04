import { Component, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  CameraResultType
} from '@capacitor/core';

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
  image: SafeResourceUrl;

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone, private sanitizer: DomSanitizer) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }


  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    })
    console.log('Got image back', image);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64_data));
  }

  async takePictureScaled() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      width: 128
    })
    console.log('Got image back', image);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64_data));
  }

  async takePictureCorrected() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      width: 128,
      correctOrientation: true
    })
    console.log('Got image back', image);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64_data));
  }

  async takePictureFile() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    })
    console.log('Got image back', image);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64_data));
  }
}
