import { AvocadoPlugin, Plugin } from '../plugin';

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}

@AvocadoPlugin({
  name: 'StatusBar',
  id: 'com.avocadojs.plugin.statusbar'
})
export class StatusBar extends Plugin {
  constructor() { super(); }

  setStyle(options: { style: StatusBarStyle }, callback) {
    this.nativeCallback('setStyle', options, callback);
  }
}
