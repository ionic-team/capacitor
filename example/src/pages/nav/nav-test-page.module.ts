import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NavTestPage } from './nav-test-page';

@NgModule({
  declarations: [
    NavTestPage,
  ],
  imports: [
    IonicPageModule.forChild(NavTestPage),
  ],
})
export class NavTestPageModule {}
