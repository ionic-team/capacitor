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
    const buttons = [options.buttonTitle || 'OK'];
    return await dialog.showMessageBox(getCurrentWindow(), {message: options.message, title: options.title, buttons});
  }

  async prompt(options: PromptOptions): Promise<PromptResult> {
    const val = window.prompt(options.message, options.inputText || '');
    return Promise.resolve({
      value: val,
      cancelled: val === null
    });
  }

  async confirm(options: ConfirmOptions): Promise<ConfirmResult> {
    const buttons = [options.okButtonTitle || 'OK' , options.cancelButtonTitle || 'Cancel'];
    const value = await dialog.showMessageBox(getCurrentWindow(), {message: options.message, title: options.title, buttons})
    return {value: value.response === 0};
  }

  async showActions(options: ActionSheetOptions): Promise<ActionSheetResult> {
    return webModals.showActions(options);
  }

}

const Modals = new ModalsPluginElectron();

export { Modals };