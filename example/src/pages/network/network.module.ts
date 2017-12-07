import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NetworkPage } from './network';

@NgModule({
  declarations: [
    NetworkPage,
  ],
  imports: [
    IonicPageModule.forChild(NetworkPage),
  ],
})
export class NetworkPageModule {}
