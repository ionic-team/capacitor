import { NativePlugin, Plugin } from '../plugin';

import { PluginCallback } from '../definitions';

@NativePlugin({
  name: 'StatusBar',
  id: 'com.avocadojs.plugin.statusbar'
})
export class StatusBar extends Plugin {

  setStyle(options: { style: StatusBarStyle }, callback: PluginCallback) {
    return this.nativeCallback('setStyle', options, callback);
  }

  show() : Promise<void> {
    return this.nativePromise('show');
  }

  hide() : Promise<void> {
    return this.nativePromise('hide');
  }
}

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}
