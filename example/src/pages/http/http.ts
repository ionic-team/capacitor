import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Plugins } from '@capacitor/core';

/**
 * Generated class for the KeyboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-http',
  templateUrl: 'http.html',
})
export class HttpPage {
  url: string = 'https://jsonplaceholder.typicode.com';
  output: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad KeyboardPage');
  }

  async get() {
    this.output = '';

    const ret = await Plugins.Http.request({
      method: 'GET',
      url: `${this.url}/posts/1`
    });
    console.log('Got ret', ret);

    this.output = JSON.stringify(ret.data);
  }

  async post() {
    this.output = '';

    const ret = await Plugins.Http.request({
      url: `${this.url}/posts`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        title: 'foo',
        body: 'bar',
        userId: 1
      }
    });
    console.log('Got ret', ret);
    this.output = JSON.stringify(ret.data);
  }

}