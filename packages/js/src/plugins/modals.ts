import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Modals',
  id: 'com.avocadojs.plugin.modals'
})
export class Modals extends Plugin {
  constructor() { super(); }

  alert(title: string, message: string, buttonTitle: string) {
    return this.nativePromise('alert', {
      title,
      message,
      buttonTitle
    });
  }

  prompt(title: string, message: string, buttonTitle: string) {
    this.nativePromise('prompt', {
      title,
      message,
      buttonTitle
    });
  }

  confirm(title: string, message: string, buttonTitle: string) {
    this.nativePromise('confirm', {
      title,
      message,
      buttonTitle
    });
  }
}
