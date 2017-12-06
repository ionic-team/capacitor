import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Network',
  id: 'com.avocadojs.plugin.network'
})
export class Network extends Plugin {

  onStatusChange(callback: NetworkStatusChangeCallback) {
    this.nativeCallback('onStatusChange', callback);
  }

}


export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export type NetworkStatusChangeCallback = (err: any, status: NetworkStatus) => void;
