import { WebPlugin, ToastPlugin } from "@capacitor/core";
import {ToastController} from "@ionic/core";

export interface ToastShowOptions {
  title: string;
  duration: 'short' | 'long';
}

export class ToastPluginElectron extends WebPlugin implements ToastPlugin {

  toastControllerPresent:boolean;

  constructor() {
    super({
      name: 'Toast',
      platforms: ['electron']
    });
    this.toastControllerPresent = true;
    let testel = document.querySelector('ion-toast-controller');
    if(testel == null) {
      console.error('No @ionic/core ToastController detected, please make sure you have included the web components.');
      this.toastControllerPresent = false;
    }
  }

  async show(options: ToastShowOptions) {
    if(this.toastControllerPresent) {
      const toastController: ToastController = document.querySelector('ion-toast-controller');
      let duration = 3000;
      if (options.duration) {
        duration = options.duration.localeCompare('long') === 0 ? 5000 : 3000;
      }
      const toastElement = await toastController.create({
        position: 'bottom',
        message: options.text,
        duration: duration,
      });
      return await toastElement.present();
    } else {
      return Promise.reject('No @ionic/core ToastController detected, please make sure you have included the web components.');
    }
  }
}

const Toast = new ToastPluginElectron();

export { Toast };
