import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'Geolocation',
  id: 'com.avocadojs.plugin.geolocation'
})
export class Geolocation extends Plugin {
  constructor() {
    super();
  }

  doThingWithCallback(callback) {
    return this.nativeCallback('doThing', {}, callback);
  }

  async getCurrentPosition() {
    return this.nativePromise('getCurrentPosition', {
      someVar: 'yo'
    }, this.getLocationWeb.bind(this));
  }

  watchPosition(callback) {
    return this.nativeCallback('watchPosition', {}, callback);
  }

  getLocationWeb() {
    console.log('Geolocation calling web fallback');

    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve(position.coords);
          console.log(position)
        })
      });
    } else {
      return Promise.reject({
        err: new Error('Geolocation is not supported by this browser.')
      });
    }
  }
}
