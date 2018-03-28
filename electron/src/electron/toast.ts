import {
  WebPlugin
} from "@capacitor/core";

export interface ToastPlugin {
  show(options: {message: string, title?: string, onclick?: () => void}): Promise<void>;
}

export class ToastPluginElectron extends WebPlugin implements ToastPlugin {

  constructor() {
    super({
      name: 'Toast',
      platforms: ['electron']
    });
  }

  show(options: any): Promise<void> {
    return new Promise<void>((resolve) => {
      let note = new Notification(options.title || 'Notification', {
        body: options.message,
      });
      if(options.onclick) {
        note.onclick = options.onclick;
      }
      resolve();
    });
  }

}

const Toast = new ToastPluginElectron();

export { Toast };
