import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Modals
} from '@avocadojs/core';

/**
 * Generated class for the ModalsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modals',
  templateUrl: 'modals.html',
})
export class ModalsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalsPage');
  }

  async showAlert() {
    let modals = new Modals()
    let alertRet = await modals.alert('Stop', 'this is an error');
  }

  async showConfirm() {
    let modals = new Modals()
    let confirmRet = await modals.confirm('Confirm', 'Are you sure you\'d like to press the red button?');
    console.log('Confirm ret', confirmRet);
  }

  async showPrompt() {
    let modals = new Modals()
    let promptRet = await modals.prompt('Hello', 'What\'s your name?');
    console.log('Prompt ret', promptRet);
  }

}
