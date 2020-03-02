import { ModalsPluginWeb, WebPlugin } from "@capacitor/core";

const webModals = new ModalsPluginWeb();

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
    return webModals.showActions(options);
  }

}

const Modals = new ModalsPluginElectron();

export { Modals };