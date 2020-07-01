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
  }

  async init() {
    await Plugins.LocalNotifications.requestPermissions();

    try {
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
      });

      Plugins.LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Notification: ', notification);
      })

      Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed', notification);
      });

    } catch(e) {
      console.log(e);
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocalNotificationsPage');
  }

  async scheduleNow() {
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 10% off!',
        body: 'Swipe now to learn more',
        // Get random id to test cancel
        id: Math.floor(Math.random()*10),
        sound: 'beep.aiff',
        attachments: [
          { id: 'face', url: 'res://public/assets/ionitron.png' }
        ],
        actionTypeId: 'OPEN_PRODUCT',
        extra: {
          productId: 'PRODUCT-1'
        }
      }]
    });
  }

  async scheduleNowWithColor() {
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 10% off!',
        body: 'Swipe now to learn more',
        // Get random id to test cancel
        id: Math.floor(Math.random()*10),
        sound: 'beep.aiff',
        attachments: [
          { id: 'face', url: 'res://public/assets/ionitron.png' }
        ],
        actionTypeId: 'OPEN_PRODUCT',
        extra: {
          productId: 'PRODUCT-1'
        },
        iconColor: '#00ff00'
      }]
    });
  }

  async scheduleNowWithIcon() {
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 10% off!',
        body: 'Swipe now to learn more',
        // Android-only: set a custom statusbar icon 
        smallIcon: "res://ic_stat_icon_sample",
        // Get random id to test cancel
        id: Math.floor(Math.random()*10),
        sound: 'beep.aiff',
        attachments: [
          { id: 'face', url: 'res://public/assets/ionitron.png' }
        ],
        actionTypeId: 'OPEN_PRODUCT',
        extra: {
          productId: 'PRODUCT-1'
        }
      }]
    });
  }

  async scheduleOnce() {
    var now = new Date();
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 20% off!',
        body: 'Swipe to learn more',
        // Get random id to test cancel
        id: Math.floor(Math.random()*10),
        sound: 'beep.aiff',
        attachments: [
          { id: 'face', url: 'res://public/assets/ionitron.png' }
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

  async scheduleRepeatingOn() {
    var now = new Date();
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Get 20% off daily',
        body: 'Swipe to learn more',
        id: 2,
        schedule: {
          on: {
            minute: new Date().getUTCMinutes()+1
          }
        }
      }]
    });
  }

  async scheduleRepeatingEvery() {
    var now = new Date();
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Happy Holidays! Last minute.',
        body: 'Swipe to learn more',
        id: 3,
        schedule: {
          every: 'minute'
        }
      }]
    });
  }

  async scheduleRepeatingEveryWithValue(value: number) {
    this.notifs = await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Happy Holidays! Last couple minutes.',
        body: 'Swipe to learn more',
        id: 4,
        schedule: {
          every: 'minute',
          count: value
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
