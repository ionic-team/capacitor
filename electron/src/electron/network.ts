import {
  WebPlugin, NetworkPlugin, NetworkStatus
} from "@capacitor/core";

export interface PluginListenerHandle {
  remove: () => void;
}

declare var window:any;

export class NetworkPluginElectron extends WebPlugin implements NetworkPlugin {

  listenerFunction:any = null;

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
      resolve({connected: connected, connectionType: connected ? 'unknown' : 'none'});
    });
  }

  addListener(eventName: 'networkStatusChange', listenerFunc: (status: NetworkStatus) => void): PluginListenerHandle {
    let thisRef = this;
    let onlineBindFunc = listenerFunc.bind(thisRef,{connected: true, connectionType: 'unknown'});
    let offlineBindFunc = listenerFunc.bind(thisRef,{connected: false, connectionType: 'none'});
    if(eventName.localeCompare('networkStatusChange') === 0) {
      window.addEventListener('online', onlineBindFunc);
      window.addEventListener('offline', offlineBindFunc);
      return {
        remove: () => {
          window.removeEventListener('online', onlineBindFunc);
          window.removeEventListener('offline', offlineBindFunc);
        }
      };
    }
  }

}

const Network = new NetworkPluginElectron();

export { Network };
