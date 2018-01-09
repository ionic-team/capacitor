import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@capacitor/core';

/**
 * Generated class for the SplashScreenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-splash-screen',
  templateUrl: 'splash-screen.html',
})
export class SplashScreenPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SplashScreenPage');
  }

  showSplash() {
    Plugins.SplashScreen.show({
      autoHide: false
    });
    setTimeout(() => {
      Plugins.SplashScreen.hide();
    }, 6000);
  }

  showSplashAutoFade() {
    Plugins.SplashScreen.show({
      showDuration: 2000,
      autoHide: true
    });
  }
}
