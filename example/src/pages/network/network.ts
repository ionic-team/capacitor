import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import {
  Network
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
    let network = new Network();
    network.onStatusChange((err, status) => {
      console.log("Network status changed", status);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NetworkPage');
  }

}
