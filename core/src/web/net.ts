import { WebPlugin } from './index';

import {
  NetworkPlugin,
  NetworkStatus
} from '../core-plugin-definitions';

declare var navigator: any;

export class NetworkPluginWeb extends WebPlugin implements NetworkPlugin {
  constructor() {
    super({
      name: 'Network',
      platforms: ['web']
    });
  }

  getStatus(): Promise<NetworkStatus> {
    return new Promise<NetworkStatus>((resolve, reject) => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!connection) {
        reject('NetInfo API not available in this browser');
      }
      const connected = navigator.onLine && (connection.type !== 'none' || connection.type >= 0)
      resolve({
        connected: connected,
        connectionType: connected ? (typeof connection.type === 'number' ?
                        Object.getOwnPropertyNames(connection)[++connection.type] :
                        connection.type || 'unknow') : 'none',
      });
    });
  }
}

const Network = new NetworkPluginWeb();

export { Network };
