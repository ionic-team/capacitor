import { WebPlugin } from '../../../index';

import type { NetworkPlugin } from './definitions';

export class NetworkWeb extends WebPlugin implements NetworkPlugin {
  constructor() {
    super({ name: 'Network' });
  }

  async getStatus(): Promise<string> {
    if (!window.navigator) {
      throw this.unimplemented(
        'Browser does not support the Network Information API',
      );
    }
    return 'all good';
  }
}
