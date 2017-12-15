import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  StatusBarStyle,
} from '@avocadojs/core';

/**
 * Generated class for the StatusBarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-status-bar',
  templateUrl: 'status-bar.html',
})
export class StatusBarPage {
  isStatusBarLight = true

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StatusBarPage');
  }

  changeStatusBar() {
    Plugins.StatusBar.setStyle({
      style: this.isStatusBarLight ? StatusBarStyle.Dark : StatusBarStyle.Light
    }, () => {});
    this.isStatusBarLight = !this.isStatusBarLight;
  }

  hideStatusBar() {
    Plugins.StatusBar.hide();
  }

  showStatusBar() {
    Plugins.StatusBar.show();
  }

}
