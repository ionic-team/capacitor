import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Geolocation',
  id: 'com.avocadojs.plugin.geolocation'
})
export class Geolocation extends Plugin {

  getCurrentPosition(): Promise<GeolocationPositon> {
    if (this.isNative) {
      return this.nativePromise('getCurrentPosition');
    }

    if (navigator.geolocation) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position);
        });
      });
    }

    return Promise.reject({
      err: new Error(`Geolocation is not supported by this browser.`)
    });
  }

  watchPosition(callback: GeolocationWatchCallback) {
    if (this.isNative) {
      this.nativeCallback('watchPosition', callback);

    } else if (navigator.geolocation) {
      const successCallback = (position: Position) => {
        callback(null, position);
      };
      const errorCallback = (error: PositionError) => {
        callback(error, null);
      };
      navigator.geolocation.watchPosition(successCallback, errorCallback);

    } else {
      console.warn(`Geolocation is not supported by this browser.`);
    }
  }

}


export interface GeolocationPositon {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export type GeolocationWatchCallback = (err: any, position: GeolocationPositon) => void;
