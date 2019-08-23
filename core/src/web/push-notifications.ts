import { WebPlugin } from './index';
import { firebase } from '@firebase/app';
import '@firebase/messaging';

import {
  PushNotificationsPlugin, 
  PushNotificationDeliveredList,
  PushNotificationChannelList,
  PushNotificationToken,
  PushNotification,
  PushNotificationActionPerformed
} from '../core-plugin-definitions';

export class PushNotificationsPluginWeb extends WebPlugin implements PushNotificationsPlugin {

  private promiseFirebase: Promise<void>;
  private firebaseMessaging: any;

  constructor() {
    super({
      name: 'PushNotifications',
      platforms: ['web']
    });
  }

  private async ensureFirebase() {
    if (!this.promiseFirebase) {
      this.promiseFirebase = new Promise((resolve, reject) => {
        const jsonConfigRequest = new XMLHttpRequest();

        jsonConfigRequest.overrideMimeType("application/json");
        jsonConfigRequest.open('GET', 'capacitor.config.json', true);
        jsonConfigRequest.onreadystatechange = async () => {
          try {
            if (jsonConfigRequest.readyState === 4) {
              if (jsonConfigRequest.status === 200) {
                const config = JSON.parse(jsonConfigRequest.responseText);

                await this.initializeFirebase(config);

                resolve();
              }
              else
                throw new Error(jsonConfigRequest.statusText);
            }
          }
          catch (ex) {
            reject('Could not parse capacitor configuration: ' + ex.message);
          }
        };

        jsonConfigRequest.send(null);
      });
    }

    await this.promiseFirebase;
  }

  private async initializeFirebase(config: any) {
    firebase.initializeApp(config.serviceWorker.firebaseConfig);

    if (!firebase.messaging.isSupported())
      throw new Error('Firebase messaging is not supported');
    else {
      const registration = await navigator.serviceWorker.ready;
      
      this.firebaseMessaging = firebase.messaging();
      this.firebaseMessaging.useServiceWorker(registration);

      await Notification.requestPermission();
      
      this.firebaseMessaging.usePublicVapidKey(config.serviceWorker.firebaseConfig.vapidKey);

      this.firebaseMessaging.onMessage((payload: any) => {
        const pushNotification: PushNotification = {
          data: payload.data,
          id: '' // Leaving blank. Nothing unique can be extracted from onMessage payload.
        };
        
        if (payload.hasOwnProperty('notification')) {
          pushNotification.title = payload.notification.title;
          pushNotification.body = payload.notification.body;

          this.notifyListeners('pushNotificationReceived', pushNotification);
        }
        else {
          const pushNotificationActionPerformed: PushNotificationActionPerformed = {
            notification: pushNotification,
            actionId: 'tap'
          };

          this.notifyListeners('pushNotificationActionPerformed', pushNotificationActionPerformed);
        }
      });

      this.firebaseMessaging.onTokenRefresh(() => { 
        this.getFirebaseToken();      
      });
    }
  }

  private async getFirebaseToken() {
    const token: PushNotificationToken = { value: await this.firebaseMessaging.getToken() };

    this.notifyListeners('registration', token);
  }

  async register(): Promise<void> {
    await this.ensureFirebase();
    await this.getFirebaseToken();
  }

  getDeliveredNotifications(): Promise<PushNotificationDeliveredList> {
    return Promise.reject('Method not implemented.');
  }

  removeDeliveredNotifications(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  removeAllDeliveredNotifications(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  createChannel(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  deleteChannel(): Promise<void> {
    return Promise.reject('Method not implemented.');
  }

  listChannels(): Promise<PushNotificationChannelList> {
    return Promise.reject('Method not implemented.');
  }

}

const PushNotifications = new PushNotificationsPluginWeb();

export { PushNotifications };
