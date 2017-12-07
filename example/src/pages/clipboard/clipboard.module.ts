import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClipboardPage } from './clipboard';

@NgModule({
  declarations: [
    ClipboardPage,
  ],
  imports: [
    IonicPageModule.forChild(ClipboardPage),
  ],
})
export class ClipboardPageModule {}
