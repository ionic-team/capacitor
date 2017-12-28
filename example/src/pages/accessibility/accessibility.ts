import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Plugins } from '@avocadojs/core';

/**
 * Generated class for the AccessibilityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-accessibility',
  templateUrl: 'accessibility.html',
})
export class AccessibilityPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    Plugins.Accessibility.addListener('accessibilityScreenReaderStateChange', ((err, state) => {
      console.log('SCREEN READER STATE CHANGE', state.value);
    }));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AccessibilityPage');
  }

  async isVoiceOverEnabled() {
    var vo = await Plugins.Accessibility.isScreenReaderEnabled();
    alert('Voice over? ' + vo);
  }

  async speak() {
    var value = await Plugins.Modals.prompt({
      title: "Value to speak",
      message: "Enter the value to speak"
    });

    Plugins.Accessibility.speak(value.value);
  }
}
