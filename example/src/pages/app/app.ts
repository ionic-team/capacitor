import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Plugins } from '@capacitor/core';

/**
 * Generated class for the AppPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-app',
  templateUrl: 'app.html',
})
export class AppPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppPage');
  }

  async canOpenUrl() {
    const ret = await Plugins.App.canOpenUrl({ url: 'com.getcapacitor.myapp' });
    console.log('Can open url: ', ret.value);
  }

  async openUrl() {
    const ret = await Plugins.App.openUrl({ url: 'com.getcapacitor.myapp://page?id=ionicframework' });
    console.log('Open url response: ', ret);
  }

  async failCall() {
    await Plugins.App.openUrl({ url: null });
  }
}
