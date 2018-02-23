import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

/**
 * Generated class for the StoragePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-storage',
  templateUrl: 'storage.html',
})
export class StoragePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StoragePage');
  }

  async setItem() {
    await Storage.set({
      key: 'name',
      value: 'Max'
    });
  }

  async getItem() {
    const value = await Storage.get({ key: 'name' });
    console.log('Got item: ', value);
  }

  async removeItem() {
    await Storage.remove({ key: 'name' });
  }

  async keys() {
    const keys = await Storage.keys();
    console.log('Got keys: ', keys);
  }

  async clear() {
    await Storage.clear();
  }

}
