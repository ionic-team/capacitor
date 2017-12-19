import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhotosPage } from './photos';

@NgModule({
  declarations: [
    PhotosPage,
  ],
  imports: [
    IonicPageModule.forChild(PhotosPage),
  ],
})
export class PhotosPageModule {}
