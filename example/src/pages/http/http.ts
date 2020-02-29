import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';

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

  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad KeyboardPage');
  }

  async get(path = '/posts/1', method = 'GET') {
    this.output = '';

    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();
    const ret = await Plugins.Http.request({
      method: method,
      url: `${this.url}${path}`
    });
    console.log('Got ret', ret);
    this.loading.dismiss();

    this.output = JSON.stringify(ret, null, 2);
  }

  head =  () => this.get('/posts/1', 'HEAD');
  delete =  () => this.mutate('/posts/1', 'DELETE', { title: 'foo', body: 'bar', userId: 1 });
  patch =   () => this.mutate('/posts/1', 'PATCH', { title: 'foo', body: 'bar', userId: 1 });
  post =    () => this.mutate('/posts', 'POST', { title: 'foo', body: 'bar', userId: 1 });
  put =     () => this.mutate('/posts/1', 'PUT', { title: 'foo', body: 'bar', userId: 1 });

  async mutate(path, method, data = {}) {
    this.output = '';
    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();
    const ret = await Plugins.Http.request({
      url: `${this.url}${path}`,
      method: method,
      headers: {
        'content-type': 'application/json'
      },
      data
    });
    console.log('Got ret', ret);
    this.loading.dismiss();
    this.output = JSON.stringify(ret, null, 2);
  }


  formPost = async () => {
    const server = 'http://localhost:3455/form-data';

    const ret = await Plugins.Http.request({
      url: server,
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: 'Max',
        age: 5
      }
    });
  }
}