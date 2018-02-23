import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StoragePage } from './storage';

@NgModule({
  declarations: [
    StoragePage,
  ],
  imports: [
    IonicPageModule.forChild(StoragePage),
  ],
})
export class StoragePageModule {}
