import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {
  Plugins
} from '@avocadojs/core';
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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    Plugins.Network.onStatusChange((err, status) => {
      console.log("Network status changed", status);
    });

    this.getStatus();
  }

  async getStatus() {
    let status = await Plugins.Network.getStatus();
    console.log('NETWORK STATUS', status);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkPage');
  }

}
