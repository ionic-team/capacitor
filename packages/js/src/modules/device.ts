import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Device',
  id: 'com.avocadojs.plugin.device'
})
export class Device extends Plugin {
  constructor() {
    super();
  }
  async getInfo() {
    return this.nativePromise('getInfo', {}, null);
  }
}
