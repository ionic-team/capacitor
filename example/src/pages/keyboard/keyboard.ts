import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Keyboard } from '@avocadojs/core';

/**
 * Generated class for the KeyboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-keyboard',
  templateUrl: 'keyboard.html',
})
export class KeyboardPage {
  isBarShowing = true;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad KeyboardPage');
  }

  show() {
    Keyboard.show();
  }
  hide() {
    Keyboard.hide();
  }

  toggleAccessoryBar() {
    if(this.isBarShowing) {
      Keyboard.hideAccessoryBar();
    } else {
      Keyboard.showAccessoryBar();
    }
    this.isBarShowing = !this.isBarShowing;
  }
}
