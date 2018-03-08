import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PushNotificationsPage } from './push-notifications';

@NgModule({
  declarations: [
    PushNotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(PushNotificationsPage),
  ],
})
export class PushNotificationsPageModule {}
