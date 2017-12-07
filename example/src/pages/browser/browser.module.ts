import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BrowserPage } from './browser';

@NgModule({
  declarations: [
    BrowserPage,
  ],
  imports: [
    IonicPageModule.forChild(BrowserPage),
  ],
})
export class BrowserPageModule {}
