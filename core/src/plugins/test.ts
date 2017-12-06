import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Test',
  id: 'com.avocadojs.plugin.test'
})
export class Test extends Plugin {

  test() {
    this.nativePromise('test', {
    });
  }

}
