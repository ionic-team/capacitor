import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@avocadojs/core';

/**
 * Generated class for the LocalNotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-local-notifications',
  templateUrl: 'local-notifications.html',
})
export class LocalNotificationsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocalNotificationsPage');
  }

  scheduleLocalNotification() {
    var now = new Date();
    Plugins.LocalNotifications.schedule({
      title: 'Get 20% off!',
      body: 'Swipe to learn more',
      identifier: 'special-deal',
      scheduleAt: {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds() + 10
      }
    }).then((r) => {
      console.log('Scheduled notification', r);
    });
  }

}
