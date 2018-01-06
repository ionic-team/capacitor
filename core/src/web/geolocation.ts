import { WebPlugin } from './index';

import {
  CancellableCallback,
  GeolocationPlugin,
  GeolocationOptions,
  GeolocationPosition,
  GeolocationWatchCallback
} from '../core-plugin-definitions';

import { PermissionsRequestResult } from '../definitions';

import { extend } from '../util';

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
        }, extend({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }, options));
      });
    });
  }

  watchPosition(options: GeolocationOptions, callback: GeolocationWatchCallback): CancellableCallback {
    let id = window.navigator.geolocation.watchPosition((pos) => {
      callback(null, pos);
    }, (err) => {
      callback(err, null);
    }, extend({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }, options));

    return {
      cancel: () => {
        window.navigator.geolocation.clearWatch(id);
      }
    };
  }
}

const Geolocation = new GeolocationPluginWeb();

export { Geolocation };
