import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'SplashScreen',
  id: 'com.avocadojs.plugin.splashscreen'
})
export class SplashScreen extends Plugin {
  constructor() { super(); }

  show(options: {}, callback) {
    this.nativeCallback('show', options, callback);
  }

  hide(options: {}, callback) {
    this.nativeCallback('hide', options, callback);
  }
}
