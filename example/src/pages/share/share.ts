import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  ShareOptions
} from '@capacitor/core';

const { Share } = Plugins;

/**
 * Generated class for the SharePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-share',
  templateUrl: 'share.html',
})
export class SharePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  async showSharing() {
    let shareRet = await Share.share({
      title: 'See cool stuff',
      text: 'Really awesome thing you need to see right meow',
      url: 'http://ionicframework.com/',
      dialogTitle: 'Share with buddies'
    });
    console.log('Share return', shareRet);
  }

  async showSharingTextOnly() {
    let shareRet = await Share.share({
      text: 'Really awesome thing you need to see right meow',
    });
    console.log('Share return', shareRet);
  }

  async showSharingUrlOnly() {
    let shareRet = await Share.share({
      url: 'http://ionicframework.com/',
    });
    console.log('Share return', shareRet);
  }

}
