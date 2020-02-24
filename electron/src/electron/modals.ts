import { WebPlugin } from "@capacitor/core";

const { dialog , getCurrentWindow } = require('electron').remote;

import {
  ModalsPlugin,
  AlertOptions,
  PromptOptions,
  PromptResult,
  ConfirmOptions,
  ConfirmResult,
  ActionSheetOptions,
  ActionSheetResult
} from "@capacitor/core";

export class ModalsPluginElectron extends WebPlugin implements ModalsPlugin {

  constructor() {
    super({
      name: 'Modals',
      platforms: ['electron']
    });
  }

  async alert(options: AlertOptions): Promise<void> {
    const alert = (message: string, title: string = '') =>
    {    
        let buttons = [options.buttonTitle || 'OK']
        dialog.showMessageBox(getCurrentWindow(), {message, title, buttons});       
    }
        alert(options.message, options.title);
        return Promise.resolve();
  }

  async prompt(options: PromptOptions): Promise<PromptResult> {
    const val = window.prompt(options.message, options.inputText || '');
    return Promise.resolve({
      value: val,
      cancelled: val === null
    });
  }

  async confirm(options: ConfirmOptions): Promise<ConfirmResult> {
    const confirm = (message: string, title: string='') =>
    {
      let buttons = [options.okButtonTitle || 'OK' , options.cancelButtonTitle || 'Cancel']
      return !dialog.showMessageBox(getCurrentWindow(), {message, title, buttons});
    }
    const val = confirm(options.message,options.title);
    return Promise.resolve({
      value: val
    });
  }

  async showActions(options: ActionSheetOptions): Promise<ActionSheetResult> {
    return new Promise<ActionSheetResult>(async (resolve, _reject) => {
      var controller: any = document.querySelector('ion-action-sheet-controller');

      if (!controller) {
        controller = document.createElement('ion-action-sheet-controller');
        document.body.appendChild(controller);
      }

      await controller.componentOnReady();

      const items = options.options.map((o, i) => {
        return {
          text: o.title,
          role: o.style && o.style.toLowerCase() || '',
          icon: o.icon || '',
          handler: () => {
            resolve({
              index: i
            });
          }
        };
      });

      const actionSheetElement = await controller.create({
        title: options.title,
        buttons: items
      });

      await actionSheetElement.present();
    });
  }

}

const Modals = new ModalsPluginElectron();

export { Modals };