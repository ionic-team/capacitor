import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'Browser',
  id: 'com.avocadojs.plugin.browser'
})
export class Browser extends Plugin {
  constructor() { super(); }
  open(url: string) {
    this.nativeCallback('open', { url });
  }
}
