import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GeolocationPage } from './geolocation';

@NgModule({
  declarations: [
    GeolocationPage,
  ],
  imports: [
    IonicPageModule.forChild(GeolocationPage),
  ],
})
export class GeolocationPageModule {}
