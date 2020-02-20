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
    let duration = options.duration ? options.duration : 2000;
    var toast = document.createElement('pwa-toast') as any;
    toast.duration = duration;
    toast.message = options.text;
    document.body.appendChild(toast);
  }
}

const Toast = new ToastPluginWeb();

export { Toast };
