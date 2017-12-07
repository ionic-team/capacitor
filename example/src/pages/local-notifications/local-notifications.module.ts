import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalNotificationsPage } from './local-notifications';

@NgModule({
  declarations: [
    LocalNotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(LocalNotificationsPage),
  ],
})
export class LocalNotificationsPageModule {}
