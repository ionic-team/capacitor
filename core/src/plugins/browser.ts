import { NativePlugin, Plugin } from '../plugin';


/**
 * Browser is an in-app-browser used to show websites and other web content.
 *
 */
@NativePlugin({
  name: 'Browser',
  id: 'com.avocadojs.plugin.browser'
})
export class Browser extends Plugin {

  /**
   * Open a browser and navigate to the given URL
   * 
   * @param url the URL to open in the browser
   */
  open(url: string) {
    if (this.isNative) {
      this.nativeCallback('open', { url });
    }

    window.open(url);
  }

}
