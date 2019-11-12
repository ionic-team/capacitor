import { WebPlugin } from './index';
import { NetworkPlugin, NetworkStatus } from '../core-plugin-definitions';

export interface PluginListenerHandle {
  remove: () => void;
}

declare var window: any;

export class NetworkPluginWeb extends WebPlugin implements NetworkPlugin {

  listenerFunction: any = null;

  constructor() {
    super({
      name: 'Network',
      platforms: ['web']
    });
  }

  getStatus(): Promise<NetworkStatus> {
    return new Promise((resolve, reject) => {
      if (!window.navigator) {
        reject('Network info not available');
        return;
      }

      let connected = window.navigator.onLine;
      let connection = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
      let connectionType = connection ? (connection.type || connection.effectiveType) : 'wifi';

      resolve({
        connected: connected,
        connectionType: connected ? connectionType : 'none'
      } as NetworkStatus);
    });
  }

  addListener(eventName: 'networkStatusChange', listenerFunc: (status: NetworkStatus) => void): PluginListenerHandle {
    let thisRef = this;
    let connection = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
    let connectionType = connection ? (connection.type || connection.effectiveType) : 'wifi';

    let onlineBindFunc = listenerFunc.bind(thisRef, { connected: true, connectionType: connectionType });
    let offlineBindFunc = listenerFunc.bind(thisRef, { connected: false, connectionType: 'none' });

    if (eventName.localeCompare('networkStatusChange') === 0) {
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

const Network = new NetworkPluginWeb();

export { Network };
