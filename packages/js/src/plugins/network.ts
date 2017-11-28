import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Network',
  id: 'com.avocadojs.plugin.network'
})
export class Network extends Plugin {
  constructor() {
    super();
  }

  onStatusChange(callback) {
    this.nativeCallback('onStatusChange', callback);
  }
}
