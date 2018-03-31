import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'test-page-nav',
  template: `
    <ion-header>

      <ion-navbar>
        <ion-title>Page</ion-title>
      </ion-navbar>

    </ion-header>

    <ion-content padding>
      <button (click)="pagePush()" ion-button>Next Page</button>
    </ion-content>
  `
})
export class NavTestPage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  pagePush() {
    this.navCtrl.push('NavTestPage');
  }
}