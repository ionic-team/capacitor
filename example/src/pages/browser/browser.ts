import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Avocado
} from '@avocadojs/core';

/**
 * Generated class for the BrowserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-browser',
  templateUrl: 'browser.html',
})
export class BrowserPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BrowserPage');
  }

  browserOpen() {
    console.log('OBJECTS');
    console.log((<any>window).Avocado);
    Avocado.Plugins.Browser.open('http://ionicframework.com');
    Avocado.Plugins.Browser.close({
      "type": "HELLO"
    });
  }

}
