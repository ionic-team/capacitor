import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SplashScreenPage } from './splash-screen';

@NgModule({
  declarations: [
    SplashScreenPage,
  ],
  imports: [
    IonicPageModule.forChild(SplashScreenPage),
  ],
})
export class SplashScreenPageModule {}
