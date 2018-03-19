import {
  WebPlugin, NetworkPlugin,
  NetworkStatus
} from "@capacitor/core";

export interface PluginListenerHandle {
  remove: () => void;
}

declare var window:any;

export class NetworkPluginElectron extends WebPlugin implements NetworkPlugin {

  constructor() {
    super({
      name: 'Network',
      platforms: ['electron']
    });
  }

  getStatus(): Promise<NetworkStatus> {
    return new Promise((resolve, reject) => {
      if(!window.navigator)
        reject('Network info not available');
      let connected = window.navigator.onLine;
      resolve({connected: connected, connectionType: connected ? 'wifi' : 'none'});
    });
  }

  addListener(eventName: 'networkStatusChange', listenerFunc: (status: NetworkStatus) => void): PluginListenerHandle {
    if(eventName.localeCompare('networkStatusChange') === 0) {
      window.addEventListener('online', listenerFunc({connected: true, connectionType: 'wifi'}));
      window.addEventListener('offline', listenerFunc({connected: false, connectionType: 'none'}));
      return {
        remove: () => {
          window.removeEventListener('online', listenerFunc({connected: true, connectionType: 'wifi'}));
          window.removeEventListener('offline', listenerFunc({connected: false, connectionType: 'none'}));
        }
      };
    }
  }

}

const Network = new NetworkPluginElectron();

export { Network };
