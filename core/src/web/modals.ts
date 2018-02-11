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

  async showActions(_options: ActionSheetOptions): Promise<ActionSheetResult> {
    // TODO: Use Ionic components to fill this in
    return Promise.reject('Not supported on the web');
  }
}

const Modals = new ModalsPluginWeb();

export { Modals };
