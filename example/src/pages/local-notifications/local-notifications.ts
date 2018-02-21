import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  LocalNotificationScheduleResult
} from '@capacitor/core';

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
    Plugins.LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'OPEN_PRODUCT',
          actions: [
            {
              id: 'view',
              title: 'Product'
            }, {
              id: 'remove', title: 'Remove', destructive: true
            },
            {
              id: 'response',
              title: 'Response',
              input: true
            }
          ]
        }
      ]
    })

    Plugins.LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification: ', notification);
    })

    Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action performed', notification);
    });
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
        sound: 'beep.aiff',
        attachments: [
          { id: 'face', url: 'res://face.jpg' }
        ],
        schedule: {
          at: new Date(now.getTime() + (10 * 1000))
        },
        actionTypeId: 'OPEN_PRODUCT',
        extra: {
          productId: 'PRODUCT-1'
        }
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
        }//.toISOString(),
      }, {
        title: 'Happy Holidays',
        body: 'Swipe to learn more',
        id: 'holidays',
        schedule: {
          every: 'minute'
        }
      }]
    });
  }

  cancelNotification() {
    this.pendingNotifs && Plugins.LocalNotifications.cancel(this.pendingNotifs);
  }

  async getPending() {
    this.pendingNotifs = await Plugins.LocalNotifications.getPending();
    console.log('PENDING', this.pendingNotifs);
  }

  toJson(o: any) {
    return JSON.stringify(o, null, 2);
  }
}
