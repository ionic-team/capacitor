import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Modals',
  id: 'com.avocadojs.plugin.modals'
})
export class Modals extends Plugin {

  alert(title: string, message: string, buttonTitle?: string) {
    return this.nativePromise('alert', {
      title,
      message,
      buttonTitle
    });
  }

  prompt(title: string,
         message: string,
         okButtonTitle?: string,
         cancelButtonTitle?: string,
         inputPlaceholder?: string) : Promise<PromptResult> {
    return this.nativePromise('prompt', {
      title,
      message,
      okButtonTitle,
      cancelButtonTitle,
      inputPlaceholder
    });
  }

  confirm(title: string,
          message: string,
          okButtonTitle?: string,
          cancelButtonTitle?: string) : Promise<ConfirmResult> {
    return this.nativePromise('confirm', {
      title,
      message,
      okButtonTitle,
      cancelButtonTitle
    });
  }
}

export interface PromptResult {
  value: string;
  cancelled: boolean;
}

export interface ConfirmResult {
  value: boolean;
}