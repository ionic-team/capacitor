import { NativePlugin, Plugin } from '../plugin';

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}

@NativePlugin({
  name: 'StatusBar',
  id: 'com.avocadojs.plugin.statusbar'
})
export class StatusBar extends Plugin {
  constructor() { super(); }

  setStyle(options: { style: StatusBarStyle }, callback) {
    this.nativeCallback('setStyle', options, callback);
  }
}
