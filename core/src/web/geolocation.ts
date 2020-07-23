import { WebPlugin } from './index';

import {
  GeolocationPlugin,
  GeolocationOptions,
  GeolocationPosition,
  GeolocationWatchCallback,
} from '../core-plugin-definitions';

import { PermissionsRequestResult } from '../definitions';

import { extend } from '../util';

export class GeolocationPluginWeb extends WebPlugin
  implements GeolocationPlugin {
  constructor() {
    super({ name: 'Geolocation' });
  }

  getCurrentPosition(
    options?: GeolocationOptions,
  ): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      return this.requestPermissions().then(
        (_result: PermissionsRequestResult) => {
          window.navigator.geolocation.getCurrentPosition(
            pos => {
              resolve(pos);
            },
            err => {
              reject(err);
            },
            extend(
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              },
              options,
            ),
          );
        },
      );
    });
  }

  watchPosition(
    options: GeolocationOptions,
    callback: GeolocationWatchCallback,
  ): string {
    let id = window.navigator.geolocation.watchPosition(
      pos => {
        callback(pos);
      },
      err => {
        callback(null, err);
      },
      extend(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
        options,
      ),
    );

    return `${id}`;
  }

  clearWatch(options: { id: string }) {
    window.navigator.geolocation.clearWatch(parseInt(options.id, 10));
    return Promise.resolve();
  }
}

const Geolocation = new GeolocationPluginWeb();

export { Geolocation };
