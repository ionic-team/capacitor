import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'Motion',
  id: 'com.avocadojs.plugin.motion'
})
export class Motion extends Plugin {
  constructor() { super(); }

  watchAccel(callback) {
    this.nativeCallback('watchAccel', callback);
  }
}
