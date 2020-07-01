import { WebPlugin } from './index';

import {
  ModalsPlugin,
  AlertOptions,
  PromptOptions,
  PromptResult,
  ConfirmOptions,
  ConfirmResult,
  ActionSheetOptions,
  ActionSheetResult
} from '../core-plugin-definitions';

export class ModalsPluginWeb extends WebPlugin implements ModalsPlugin {
  constructor() {
    super({
      name: 'Modals',
      platforms: ['web']
    });
  }

  async alert(options: AlertOptions): Promise<void> {
    window.alert(options.message);
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
    const val = window.confirm(options.message);
    return Promise.resolve({
      value: val
    });
  }

  async showActions(options: ActionSheetOptions): Promise<ActionSheetResult> {
    return new Promise<ActionSheetResult>(async (resolve, _reject) => {
      var actionSheet: any = document.querySelector('pwa-action-sheet');
      if (!actionSheet) {
        actionSheet = document.createElement('pwa-action-sheet');
        document.body.appendChild(actionSheet);
      }
      actionSheet.header = options.title;
      actionSheet.cancelable = false;
      actionSheet.options = options.options;
      actionSheet.addEventListener('onSelection', async (e: any) => {
        const selection = e.detail;
        resolve({
          index: selection
        });
      });
    });
  }
}

const Modals = new ModalsPluginWeb();

export { Modals };
