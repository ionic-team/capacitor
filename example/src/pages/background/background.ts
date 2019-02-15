import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Plugins } from '@capacitor/core';

const { BackgroundTask } = Plugins;

/**
 * Generated class for the BackgroundPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-background',
  templateUrl: 'background.html',
})
export class BackgroundPage {
  taskId: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BackgroundPage');
  }

  startTask() {
    this.taskId = BackgroundTask.beforeExit(async () => {
      return new Promise((resolve, reject) => {

        // Do a long task you want to finish
        // even if the device enters into background mode
        var start = new Date().getTime();
        for (var i = 0; i < 1e18; i++) {
          if ((new Date().getTime() - start) > 20000){
            break;
          }
        }
        console.log('TASK DONE!', this.taskId);

        // Must call in order to end our task
        BackgroundTask.finish({
          taskId: this.taskId
        });
        resolve();
      });
    })
    console.log('Starting background task:', this.taskId);
  }

}
