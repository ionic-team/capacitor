import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';

import { FilesystemDirectory, Plugins } from '@capacitor/core';
import { SERVER_TRANSITION_PROVIDERS } from '@angular/platform-browser/src/browser/server-transition';

const { Filesystem, Http } = Plugins;

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

  output: string = '';

  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad KeyboardPage');
  }

  async get(path = '/get', method = 'GET') {
    this.output = '';

    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();

    try {
      const ret = await Http.request({
        method: method,
        url: this.apiUrl(path),
        headers: {
          'X-Fake-Header': 'Max was here'
        },
        params: {
          'size': 'XL'
        }
      });
      console.log('Got ret', ret);
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  getJson = () => this.get('/get-json');
  getHtml = () => this.get('/get-html');

  head = () => this.get('/head', 'HEAD');
  delete = () => this.mutate('/delete', 'DELETE', { title: 'foo', body: 'bar', userId: 1 });
  patch = () => this.mutate('/patch', 'PATCH', { title: 'foo', body: 'bar', userId: 1 });
  post = () => this.mutate('/post', 'POST', { title: 'foo', body: 'bar', userId: 1 });
  put = () => this.mutate('/put', 'PUT', { title: 'foo', body: 'bar', userId: 1 });

  async mutate(path, method, data = {}) {
    this.output = '';
    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();
    try {
      const ret = await Http.request({
        url: this.apiUrl(path),
        method: method,
        headers: {
          'content-type': 'application/json',
        },
        data
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  apiUrl = (path: string) => `${this.serverUrl}${path}`;

  testSetCookies = () => this.get('/set-cookies');

  formPost = async () => {
    this.output = '';
    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();
    try {
      const ret = await Http.request({
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
      console.log('Got ret', ret);
      this.loading.dismiss();
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  formPostMultipart = async () => {
    this.output = '';
    this.loading = this.loadingCtrl.create({
      content: 'Requesting...'
    });
    this.loading.present();
    try {
      const ret = await Http.request({
        url: this.apiUrl('/form-data-multi'),
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data'
        },
        data: {
          name: 'Max',
          age: 5
        }
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
      this.output = JSON.stringify(ret, null, 2);
    } catch (e) {
      this.output = `Error: ${e.message}, ${e.platformMessage}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  setCookie = async () => {
    const ret = await Http.setCookie({
      url: this.apiUrl('/cookie'),
      key: 'language',
      value: 'en'
    });
  }

  deleteCookie = async () => {
    const ret = await Http.deleteCookie({
      url: this.apiUrl('/cookie'),
      key: 'language',
    });
  }

  clearCookies = async () => {
    const ret = await Http.clearCookies({
      url: this.apiUrl('/cookie'),
    });
  }

  getCookies = async () => {
    const ret = await Http.getCookies({
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
    try {
      const ret = await Http.request({
        method: 'GET',
        url: this.apiUrl('/cookie')
      });
      console.log('Got ret', ret);
      this.loading.dismiss();
    } catch (e) {
      this.output = `Error: ${e.message}`;
      console.error(e);
    } finally {
      this.loading.dismiss();
    }
  }

  downloadFile = async () => {
    console.log('Doing download', FilesystemDirectory.Downloads);

    const ret = await Http.downloadFile({
      url: this.apiUrl('/download-pdf'),
      filePath: 'document.pdf',
      fileDirectory: FilesystemDirectory.Downloads
    });

    console.log('Got download ret', ret);


    /*
    const renameRet = await Filesystem.rename({
      from: ret.path,
      to: 'document.pdf',
      toDirectory: FilesystemDirectory.Downloads
    });

    console.log('Did rename', renameRet);
    */

    if (ret.path) {
      const read = await Filesystem.readFile({
        path: 'document.pdf',
        directory: FilesystemDirectory.Downloads
      });

      console.log('Read', read);
    }
  }

  uploadFile = async () => {
    const ret = await Http.uploadFile({
      url: this.apiUrl('/upload-pdf'),
      name: 'myFile',
      filePath: 'document.pdf',
      fileDirectory: FilesystemDirectory.Downloads
    });

    console.log('Got upload ret', ret);
  }
}