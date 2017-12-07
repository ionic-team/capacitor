import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Haptics,
  HapticsImpactStyle
} from '@avocadojs/core';

/**
 * Generated class for the HapticsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-haptics',
  templateUrl: 'haptics.html',
})
export class HapticsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HapticsPage');
  }

  hapticsImpact(style = HapticsImpactStyle.Heavy) {
    let haptics = new Haptics()
    haptics.impact({
      style: style
    });
  }

  hapticsImpactMedium(style) {
    this.hapticsImpact(HapticsImpactStyle.Medium);
  }

  hapticsImpactLight(style) {
    this.hapticsImpact(HapticsImpactStyle.Light);
  }

  hapticsVibrate() {
    let haptics = new Haptics()
    haptics.vibrate();
  }

  hapticsSelectionStart() {
    let haptics = new Haptics()
    haptics.selectionStart();
  }

  hapticsSelectionChanged() {
    let haptics = new Haptics()
    haptics.selectionChanged();
  }

  hapticsSelectionEnd() {
    let haptics = new Haptics()
    haptics.selectionEnd();
  }

}
