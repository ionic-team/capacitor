import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Browser',
  id: 'com.avocadojs.plugin.browser'
})
export class Browser extends Plugin {

  open(url: string) {
    if (this.isNative) {
      this.nativeCallback('open', { url });
    }

    window.open(url);
  }

}
