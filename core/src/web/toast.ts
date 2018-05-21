import { WebPlugin } from './index';
import { ToastPlugin, ToastShowOptions } from '../core-plugin-definitions';

export class ToastPluginWeb extends WebPlugin implements ToastPlugin {

  constructor() {
    super({
      name: 'Toast',
      platforms: ['web']
    });
  }

  async show(options: ToastShowOptions) {
    var controller: any = document.querySelector('ion-toast-controller');
    if (!controller) {
      controller = document.createElement('ion-toast-controller');
      document.body.appendChild(controller);
    }
    await controller.componentOnReady();
   
    let duration = 3000;
    if (options.duration) {
      duration = options.duration === 'long' ? 5000 : 3000;
    }
    const toast = await controller.create({
      position: 'bottom',
      message: options.text,
      duration: duration,
    });
    return await toast.present();
  }
}

const Toast = new ToastPluginWeb();

export { Toast };
