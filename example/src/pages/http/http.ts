import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';

import { Plugins } from '@capacitor/core';
import { SERVER_TRANSITION_PROVIDERS } from '@angular/platform-browser/src/browser/server-transition';

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
  serverUrl = 'http://localhost:3455';
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

  apiUrl = (path: string) => `${this.serverUrl}${path}`;

  formPost = async () => {
    const ret = await Plugins.Http.request({
      url: this.apiUrl('/form-data'),
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

  setCookie = async () => {
    const ret = await Plugins.Http.setCookie({
      url: this.apiUrl('/cookie'),
      key: 'language',
      value: 'en'
    });
  }

  getCookies = async () => {
    const ret = await Plugins.Http.getCookies({
      url: this.apiUrl('/cookie')
    });
    console.log('Got cookies', ret);
    this.output = JSON.stringify(ret.value);
  }

  testCookies = async () => {
    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();
    const ret = await Plugins.Http.request({
      method: 'GET',
      url: this.apiUrl('/cookie')
    });
    console.log('Got ret', ret);
    this.loading.dismiss();
  }

  downloadFile = async () => {
    const ret = await Plugins.Http.downloadFile({
      url: this.apiUrl('/download-pdf'),
      filePath: 'document.pdf'
    });
  }

  uploadFile = async () => {
  }
}