import { WebPlugin } from "@capacitor/core";


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

}

const Modals = new ModalsPluginElectron();

export { Modals };
