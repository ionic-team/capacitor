import { WebPlugin, ToastPlugin } from "@capacitor/core";
import {ToastController} from "@ionic/core";

export interface ToastShowOptions {
  title: string;
  duration: 'short' | 'long';
}

export class ToastPluginElectron extends WebPlugin implements ToastPlugin {

  constructor() {
    super({
      name: 'Toast',
      platforms: ['electron']
    });
    let testel = document.querySelector('ion-toast-controller');
    if(testel == null) {
      console.error()
    }
  }

  async show(options: ToastShowOptions) {
    const toastController:ToastController = document.querySelector('ion-toast-controller');
    let duration = 3000;
    if(options.duration) {
      duration = options.duration.localeCompare('long') === 0 ? 5000 : 3000;
    }
    const toastElement = await toastController.create({
      position: 'bottom',
      message: options.title,
      duration: duration,
    });
    return await toastElement.present();
  }

}

const Toast = new ToastPluginElectron();

export { Toast };
