import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccessibilityPage } from './accessibility';

@NgModule({
  declarations: [
    AccessibilityPage,
  ],
  imports: [
    IonicPageModule.forChild(AccessibilityPage),
  ],
})
export class AccessibilityPageModule {}
