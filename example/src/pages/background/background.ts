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
        setTimeout(() => {
          console.log('TASK DONE!', this.taskId);

          // Must call in order to end our task
          BackgroundTask.finish({
            taskId: this.taskId
          });

          resolve();
        }, 30000);
      });
    })
    console.log('Starting background task:', this.taskId);
  }

}
