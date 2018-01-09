import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@capacitor/core';

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
  ori = null

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MotionPage');
  }

  watchAccel() {
    const watchListener = Plugins.Motion.addListener('accel', (values) => {
      this.zone.run(() => {
        const v = {
          x: values.acceleration.x.toFixed(4),
          y: values.acceleration.y.toFixed(4),
          z: values.acceleration.z.toFixed(4)
        }
        this.accel = v;
      });
    });

    setTimeout(() => {
      watchListener.remove();
    }, 5000);
  }

  watchOrientation() {
    const watchListener = Plugins.Motion.addListener('orientation', (values) => {
      this.zone.run(() => {
        const v = {
          alpha: values.alpha.toFixed(4),
          beta: values.beta.toFixed(4),
          gamma: values.gamma.toFixed(4)
        }
        this.ori = v;
      });
    });
    setTimeout(() => {
      watchListener.remove();
    }, 5000);
  }

}
