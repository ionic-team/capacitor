import { NativePlugin, Plugin } from '../plugin';

export enum HapticsImpactStyle {
  Heavy = 'HEAVY',
  Medium = 'MEDIUM',
  Light = 'LIGHT'
}

@NativePlugin({
  name: 'Haptics',
  id: 'com.avocadojs.plugin.haptics'
})
export class Haptics extends Plugin {
  constructor() { super(); }

  impact(options: { style: HapticsImpactStyle }) {
    this.nativeCallback('impact', options);
  }

  vibrate() {
    this.nativeCallback('vibrate');
  }

  selectionStart() {
    this.nativeCallback('selectionStart');
  }

  selectionChanged() {
    this.nativeCallback('selectionChanged');
  }

  selectionEnd() {
    this.nativeCallback('selectionEnd');
  }
}
