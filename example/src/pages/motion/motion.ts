import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@avocadojs/core';

/**
 * Generated class for the MotionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-motion',
  templateUrl: 'motion.html',
})
export class MotionPage {
  accel = null

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MotionPage');
  }

  watchAccel() {
    Plugins.Motion.watchAccel((err, values) => {
      this.zone.run(() => {
        const v = {
          x: values.x.toFixed(4),
          y: values.y.toFixed(4),
          z: values.z.toFixed(4)
        }
        this.accel = v;
      });
    });
  }

}
