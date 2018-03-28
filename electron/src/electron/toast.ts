import { WebPlugin, ToastPlugin } from "@capacitor/core";

import {ToastController} from "@ionic/core";

export class ToastPluginElectron extends WebPlugin implements ToastPlugin {

  constructor() {
    super({
      name: 'Toast',
      platforms: ['electron']
    });
    if(document.querySelector('ion-toast-controller') === null) {
      let toastEl = document.createElement('ion-toast-controller');
      let firstEl = document.body.children[0];
      document.insertBefore(toastEl, firstEl);
    }
  }

  async show(message: string, position?: 'top' | 'middle' | 'bottom', duration?: number) {
    const toastController:ToastController = document.querySelector('ion-toast-controller');
    const toastElement = await toastController.create({
      position: position || 'bottom',
      message: message,
      duration: duration || 3000,
    });
    return await toastElement.present();
  }

}

const Toast = new ToastPluginElectron();

export { Toast };
