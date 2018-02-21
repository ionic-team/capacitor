import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {
  Plugins
} from '@capacitor/core';

const { Network } = Plugins;

/**
 * Generated class for the NetworkPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-network',
  templateUrl: 'network.html',
})
export class NetworkPage {
  handler = null;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.getStatus();
  }

  startListen() {
    this.handler = Network.addListener('networkStatusChange', (status) => {
      console.log("Network status changed", status);
    });
  }

  endListen() {
    this.handler && this.handler.remove();
  }

  async getStatus() {
    let status = await Network.getStatus();
    console.log('NETWORK STATUS', status);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkPage');
  }

}
