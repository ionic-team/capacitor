import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  LocalNotificationScheduleResult
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
  notifs: LocalNotificationScheduleResult;
  pendingNotifs: LocalNotificationScheduleResult;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocalNotificationsPage');
  }

  async scheduleOnce() {
    var now = new Date();
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 20% off!',
        body: 'Swipe to learn more',
        id: 'special-deal',
        schedule: {
          //at: new Date(now.getTime() + (10 * 1000)).toISOString()
          at: new Date(now.getTime() + (10 * 1000)),
          repeats: true
        },
        actions: [
          { id: 'clear', title: 'Clear' },
          { id: 'snooze', title: 'Snooze' }
        ]
      }]
    });
  }

  async scheduleRepeating() {
    var now = new Date();
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 20% off!',
        body: 'Swipe to learn more',
        id: 'special-deal',
        schedule: {
          on: {
            day: 1
          }
        },//.toISOString(),
        actions: [
          { id: 'clear', title: 'Clear' },
          { id: 'snooze', title: 'Snooze' }
        ]
      }, {
        title: 'Happy Holidays',
        body: 'Swipe to learn more',
        id: 'holidays',
        schedule: {
          every: 'minute'
        },
        actions: [
          { id: 'clear', title: 'Clear' },
          { id: 'snooze', title: 'Snooze' }
        ]
      }]
    });
  }

  cancelNotification() {
    this.notifs && Plugins.LocalNotifications.cancel(this.notifs);
  }

  async getPending() {
    this.pendingNotifs = await Plugins.LocalNotifications.getPending();
    console.log('PENDING', this.pendingNotifs);
  }

  toJson(o: any) {
    return JSON.stringify(o, null, 2);
  }
}
