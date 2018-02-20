import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BackgroundPage } from './background';

@NgModule({
  declarations: [
    BackgroundPage,
  ],
  imports: [
    IonicPageModule.forChild(BackgroundPage),
  ],
})
export class BackgroundPageModule {}
