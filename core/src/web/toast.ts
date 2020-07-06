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
    let duration = 2000;
    if (options.duration) {
      duration = options.duration === 'long' ? 3500 : 2000;
    }
    const toast = document.createElement('pwa-toast') as any;
    toast.duration = duration;
    toast.message = options.text;
    document.body.appendChild(toast);
  }
}

const Toast = new ToastPluginWeb();

export { Toast };
