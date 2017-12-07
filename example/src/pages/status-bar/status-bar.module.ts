import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StatusBarPage } from './status-bar';

@NgModule({
  declarations: [
    StatusBarPage,
  ],
  imports: [
    IonicPageModule.forChild(StatusBarPage),
  ],
})
export class StatusBarPageModule {}
