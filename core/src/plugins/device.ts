import { NativePlugin, Plugin } from '../plugin';


/**
 * The Device API returns data about the underlying device.
 */
@NativePlugin({
  name: 'Device',
  id: 'com.avocadojs.plugin.device'
})
export class Device extends Plugin {

  getInfo(): Promise<DeviceInfo> {
    if (this.isNative) {
      return this.nativePromise('getInfo');
    }

    return Promise.resolve({
      model: navigator.userAgent,
      platform: 'browser',
      uuid: '',
      version: navigator.userAgent,
      manufacturer: navigator.userAgent,
      isVirtual: false,
      serial: ''
    });
  }

}


export interface DeviceInfo {
  model: string;
  platform: string;
  uuid: string;
  version: string;
  manufacturer: string;
  isVirtual: boolean;
  serial: string;
}
