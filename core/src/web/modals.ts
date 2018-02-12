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
    const val = window.prompt(options.message, options.inputPlaceholder || '');
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

const Modals = new ModalsPluginWeb();

export { Modals };
