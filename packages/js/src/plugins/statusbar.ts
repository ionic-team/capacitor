import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'StatusBar',
  id: 'com.avocadojs.plugin.statusbar'
})
export class StatusBar extends Plugin {

  setStyle(options: { style: StatusBarStyle }, callback: StatusBarSetStyleCallback) {
    this.nativeCallback('setStyle', options, callback);
  }

}

export type StatusBarSetStyleCallback = (err: any, results: any) => void;

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}
