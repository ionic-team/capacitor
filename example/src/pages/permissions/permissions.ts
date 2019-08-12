import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Capacitor, PermissionType } from '@capacitor/core';
const { Plugins } = Capacitor;
/**
 * Generated class for the PermissionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-permissions',
  templateUrl: 'permissions.html',
})
export class PermissionsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PermissionsPage');
  }

  a(message: string) {
    const alert = this.alertCtrl.create({
      title: 'Has Permission?',
      message
    });
    alert.present();
  }

  async checkCamera() {
    const has = await Plugins.Permissions.query({ name: PermissionType.Camera });
    this.a('Camera? ' + has.state);
  }

  async checkPhotos() {
    const has = await Plugins.Permissions.query({ name: PermissionType.Photos });
    this.a('Photos? ' + has.state);
  }

  async checkGeo() {
    const has = await Plugins.Permissions.query({ name: PermissionType.Geolocation });
    this.a('Geo? ' + has.state);
  }

  async checkPush() {
    const has = await Plugins.Permissions.query({ name: PermissionType.Notifications });
    this.a('Push? ' + has.state);
  }

  async checkClipboard() {
    const hasRead = await Plugins.Permissions.query({ name: PermissionType.ClipboardRead });
    const hasWrite = await Plugins.Permissions.query({ name: PermissionType.ClipboardWrite });
    this.a(`Clipboard - Read? ${hasRead.state} Write? ${hasWrite.state}`);
  }
}
