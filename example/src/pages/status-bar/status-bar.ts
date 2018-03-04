import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';

const { StatusBar } = Plugins;

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
    });
    this.isStatusBarLight = !this.isStatusBarLight;
  }

  hideStatusBar() {
    Plugins.StatusBar.hide();
  }

  showStatusBar() {
    Plugins.StatusBar.show();
  }

  setBackgroundColor() {
    const bits = [0, 0, 0];
    const randomColor = bits.map(b => {
      const v = Math.floor(Math.random() * 0xff).toString(16);
      if (v.length < 2) {
        return '0' + v;
      }
      return v;
    }).join('');
    console.log(`Random color: #${randomColor}`);
    StatusBar.setBackgroundColor({ color: `#${randomColor}` })
  }
}
