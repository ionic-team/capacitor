import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Motion',
  id: 'com.avocadojs.plugin.motion'
})
export class Motion extends Plugin {
  constructor() { super(); }

  watchAccel(callback) {
    this.nativeCallback('watchAccel', callback);
  }
}
