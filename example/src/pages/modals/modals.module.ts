import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalsPage } from './modals';

@NgModule({
  declarations: [
    ModalsPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalsPage),
  ],
})
export class ModalsPageModule {}
