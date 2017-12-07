import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  SplashScreen
} from '@avocadojs/core';

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
    let s = new SplashScreen();
    s.show({
      autoHide: false
    });
    setTimeout(() => {
      s.hide();
    }, 6000);
  }

  showSplashAutoFade() {
    let s = new SplashScreen();
    s.show({
      showDuration: 2000,
      autoHide: true
    });
  }
}
