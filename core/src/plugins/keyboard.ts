import { Plugin } from '../plugin';

export class KeyboardPlugin extends Plugin {
  static ID = 'com.avocadojs.plugin.keyboard';

  constructor() {
    super();
    this._init();
  }

  _onChange(_err: any, d: any) { console.log('Keyboard change', d);
  }

  _init() {
    return this.nativeCallback('subscribe', this._onChange.bind(this));
  }

  show() {
    return this.nativePromise('show');
  }

  hide() {
    return this.nativePromise('hide');
  }

  hideAccessoryBar() {
    return this.nativePromise('setAccessoryBarVisible', {
      visible: false
    });
  }

  showAccessoryBar() {
    return this.nativePromise('setAccessoryBarVisible', {
      visible: true
    });
  }
}

const Keyboard = new KeyboardPlugin();
export { Keyboard };
