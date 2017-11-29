import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Modals',
  id: 'com.avocadojs.plugin.modals'
})
export class Modals extends Plugin {

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
