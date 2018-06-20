import { WebPlugin } from "@capacitor/core";

declare var require: any
const {dialog , getCurrentWindow} = require('electron').remote

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
    //window.alert(options.message); we can't set title and button title
    const alert = (message: string, title: string = '') =>
    {    
        
        let buttons = [options.buttonTitle || 'OK']
        dialog.showMessageBox(getCurrentWindow(), {message, title, buttons});       
    }
        alert(options.message, options.title);
        return Promise.resolve();
  }  

}

const Modals = new ModalsPluginElectron();

export { Modals };
