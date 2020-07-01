import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@capacitor/core';

/**
 * Generated class for the ClipboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-clipboard',
  templateUrl: 'clipboard.html',
})
export class ClipboardPage {
  base64Image: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.loadImage();
  }
  async loadImage() {
    const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string' || reader.result instanceof String) {
          this.base64Image = reader.result.replace('data:;base64,', '');
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))

    toDataURL('assets/ionitron.png');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClipboardPage');
  }

  clipboardSetString() {
    Plugins.Clipboard.write({
      string: "Hello, Moto"
    });
  }

  async clipboardGetString() {
    let str = await Plugins.Clipboard.read();
    console.log('Got string from clipboard:', str.value);
  }

  clipboardSetEmptyString() {
    Plugins.Clipboard.write({
      string: ""
    });
  }

  async clipboardGetEmptyString() {
    let str = await Plugins.Clipboard.read();
    console.log('Got string from clipboard:', str.value);
  }

  clipboardSetURL() {
    Plugins.Clipboard.write({
      url: "http://google.com/"
    });
  }

  async clipboardGetURL() {
    let url = await Plugins.Clipboard.read();
    console.log("Get URL from clipboard", url.value);
  }

  clipboardSetImage () {
    console.log('Setting image', this.base64Image);
    Plugins.Clipboard.write({
      image: this.base64Image
    });
  }

  async clipboardGetImage() {
    const image = await Plugins.Clipboard.read();
    console.log('Got image', image.value);
  }
}
