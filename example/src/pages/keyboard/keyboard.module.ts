import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { KeyboardPage } from './keyboard';

@NgModule({
  declarations: [
    KeyboardPage,
  ],
  imports: [
    IonicPageModule.forChild(KeyboardPage),
  ],
})
export class KeyboardPageModule {}
