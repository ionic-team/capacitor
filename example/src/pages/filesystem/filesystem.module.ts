import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FilesystemPage } from './filesystem';

@NgModule({
  declarations: [
    FilesystemPage,
  ],
  imports: [
    IonicPageModule.forChild(FilesystemPage),
  ],
})
export class FilesystemPageModule {}
