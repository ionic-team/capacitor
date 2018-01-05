import { WebPlugin } from './index';

import {
  CancellableCallback,
  GeolocationPlugin,
  GeolocationOptions,
  GeolocationPosition,
  GeolocationWatchCallback
} from '../core-plugin-definitions';
import { PermissionsRequestResult } from '../definitions';

export class GeolocationPluginWeb extends WebPlugin implements GeolocationPlugin {
  constructor() {
    super({
      name: 'Geolocation',
      platforms: ['android']
    });
  }

  getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      return this.requestPermissions().then((_result: PermissionsRequestResult) => {
        window.navigator.geolocation.getCurrentPosition((pos) => {
          resolve(pos);
        }, (err) => {
          reject(err);
        }, options);
      });
    });
  }

  watchPosition(options: GeolocationOptions, callback: GeolocationWatchCallback): CancellableCallback {
    let id = window.navigator.geolocation.watchPosition((pos) => {
      callback(null, pos);
    }, (err) => {
      callback(err, null);
    }, options);

    return {
      cancel: () => {
        window.navigator.geolocation.clearWatch(id);
      }
    };
  }
}

const Geolocation = new GeolocationPluginWeb();

export { Geolocation };
