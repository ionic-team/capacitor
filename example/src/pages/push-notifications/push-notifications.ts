import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Plugins } from '@capacitor/core';
const { PushNotifications } = Plugins;

/**
 * Generated class for the PushNotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-push-notifications',
  templateUrl: 'push-notifications.html',
})
export class PushNotificationsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PushNotificationsPage');
  }

  async requestPerms() {
    const ret = await PushNotifications.requestPermissions();
    console.log('Permissions request result', ret);
  }

  async init() {
    await PushNotifications.setup({
    });
  }
}
