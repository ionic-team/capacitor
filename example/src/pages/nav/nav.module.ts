import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NavPage } from './nav';

@NgModule({
  declarations: [
    NavPage,
  ],
  imports: [
    IonicPageModule.forChild(NavPage),
  ],
})
export class NavPageModule {}
