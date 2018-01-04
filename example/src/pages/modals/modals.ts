import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  ActionSheetOptionStyle
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
    let alertRet = await Plugins.Modals.alert({
      title: 'Stop',
      message: 'this is an error'
    });
  }

  async showConfirm() {
    let confirmRet = await Plugins.Modals.confirm({
      title: 'Confirm',
      message: 'Are you sure you\'d like to press the red button?'
    });
    console.log('Confirm ret', confirmRet);
  }

  async showPrompt() {
    let promptRet = await Plugins.Modals.prompt({
      title: 'Hello',
      message: 'What\'s your name?'
    });
    console.log('Prompt ret', promptRet);
  }

  async showActions() {
    let promptRet = await Plugins.Modals.showActions({
      title: 'Photo Options',
      message: 'Select an option to perform',
      options: [
        {
          title: 'Upload'
        },
        {
          title: 'Share'
        },
        {
          title: 'Remove',
          style: ActionSheetOptionStyle.Destructive
        }
      ]
    })
    console.log('You selected', promptRet);
  }

  async showSharing() {
    let shareRet = await Plugins.Modals.showSharing({
      message: 'Really awesome thing you need to see right meow',
      url: 'http://ionicframework.com/',
      subject: 'See cool stuff'
    });
    console.log('Share return', shareRet);
  }

  nativeAlert() {
    alert('This is a browser alert');
  }
  nativeConfirm() {
    var yes = confirm('Do it?');
    console.log('Confirm result', yes);
  }
  nativePrompt() {
    var val = prompt('Enter name');
    console.log('Val:', val);
  }
}
