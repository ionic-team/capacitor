import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HapticsPage } from './haptics';

@NgModule({
  declarations: [
    HapticsPage,
  ],
  imports: [
    IonicPageModule.forChild(HapticsPage),
  ],
})
export class HapticsPageModule {}
