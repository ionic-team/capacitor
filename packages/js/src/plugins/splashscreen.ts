import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'SplashScreen',
  id: 'com.avocadojs.plugin.splashscreen'
})
export class SplashScreen extends Plugin {

<<<<<<< HEAD
  show(options?: SplashScreenShowOptions, callback?: Function) {
    this.nativeCallback('show', options, callback);
  }

  hide(options?: SplashScreenHideOptions, callback?: Function) {
=======
  show(options?: {}, callback?) {
    this.nativeCallback('show', options, callback);
  }

  hide(options?: {}, callback?) {
>>>>>>> Show/Hide splash from splash image
    this.nativeCallback('hide', options, callback);
  }

}


export interface SplashScreenShowOptions {}

export interface SplashScreenHideOptions {}
