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
    let duration = 3000;
    if (options.duration) {
      duration = options.duration === 'long' ? 5000 : 3000;
    }
    const toast = document.createElement('pwa-toast') as any;
    toast.duration = duration;
    toast.message = options.text;
    toast.position = options.position;
    document.body.appendChild(toast);
  }
}

const Toast = new ToastPluginWeb();

export { Toast };
