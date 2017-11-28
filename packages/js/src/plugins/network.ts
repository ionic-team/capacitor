import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'Network',
  id: 'com.avocadojs.plugin.network'
})
export class Network extends Plugin {
  constructor() { super(); }

  onStatusChange(callback) {
    this.nativeCallback('onStatusChange', callback);
  }
}
