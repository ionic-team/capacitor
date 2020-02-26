import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HttpPage } from './http';

@NgModule({
  declarations: [
    HttpPage,
  ],
  imports: [
    IonicPageModule.forChild(HttpPage),
  ],
})
export class HttpPageModule { }
