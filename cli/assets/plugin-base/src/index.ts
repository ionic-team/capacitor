import { NativePlugin, Plugin } from 'avocadojs';


@NativePlugin({
  name: '__PLUGINNAME__',
  id: 'com.avocadojs.plugin.NAME'
})
export class __PLUGINNAME__ extends Plugin {

  getMagicNumber(): Promise<number> {
    return this.nativePromise('getMagicNumber');
  }

  getMagicStruct(): Promise<any> {
    if (this.isNative) {
      return this.nativeCallback('getMagicStruct');

    } else {
      console.warn(`We are not running in a native environment.`);
    }
  }

}
