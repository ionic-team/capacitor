import { NativePlugin, Plugin } from '../plugin';

export interface NotificationScheduleAt {
  month?: number;
  day?: number;
  year?: number;
  hour?: number;
  minute?: number;
  second?: number;
}
export interface LocalNotification {
  title: string;
  body: string;
  identifier: string;
  scheduleAt?: NotificationScheduleAt
}
@NativePlugin({
  name: 'LocalNotifications',
  id: 'com.avocadojs.plugin.localnotifications'
})
export class LocalNotifications extends Plugin {
  constructor() { super(); }

  schedule(notification: LocalNotification) {
    return this.nativePromise('schedule', notification);
  }
}
