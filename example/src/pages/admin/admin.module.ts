import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminPage } from './admin';

@NgModule({
  declarations: [
    AdminPage,
  ],
  imports: [
    IonicPageModule.forChild(AdminPage),
  ],
})
export class AdminPageModule {}
