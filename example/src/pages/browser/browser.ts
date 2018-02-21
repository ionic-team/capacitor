import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@capacitor/core';

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
    Plugins.Browser.addListener('browserFinished', (info: any) => {
      console.log('Browser all done!');
    });
    Plugins.Browser.addListener('browserPageLoaded', (info: any) => {
      console.log('Browser page loaded!');
    });
    Plugins.Browser.prefetch({
      urls: ["https://ionicframework.com/"]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BrowserPage');
  }

  browserOpen() {
    Plugins.Browser.open({
      url: 'https://ionicframework.com',
      toolbarColor: "#5A5DF5"
    });

    setTimeout(() => {
      Plugins.Browser.close();
    }, 5000);
  }

}
