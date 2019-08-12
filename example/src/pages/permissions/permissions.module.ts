import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PermissionsPage } from './permissions';

@NgModule({
  declarations: [
    PermissionsPage,
  ],
  imports: [
    IonicPageModule.forChild(PermissionsPage),
  ],
})
export class PermissionsPageModule {}
