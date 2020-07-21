import { WebPlugin } from './index';

import {
  AccessibilityPlugin,
  AccessibilitySpeakOptions,
  ScreenReaderEnabledResult,
} from '../core-plugin-definitions';

export class AccessibilityPluginWeb extends WebPlugin
  implements AccessibilityPlugin {
  constructor() {
    super({ name: 'Accessibility' });
  }

  isScreenReaderEnabled(): Promise<ScreenReaderEnabledResult> {
    throw new Error('Feature not available in the browser');
  }

  speak(options: AccessibilitySpeakOptions): Promise<void> {
    if (!('speechSynthesis' in window)) {
      return Promise.reject(
        'Browser does not support the Speech Synthesis API',
      );
    }

    var utterance = new SpeechSynthesisUtterance(options.value);
    if (options.language) {
      utterance.lang = options.language;
    }
    window.speechSynthesis.speak(utterance);
    return Promise.resolve();
  }
}

const Accessibility = new AccessibilityPluginWeb();

export { Accessibility };
