import { NativePlugin, Plugin } from '../plugin';

export interface VibrateOptions {
  duration?: number;
}

@NativePlugin({
  name: 'Haptics',
  id: 'com.avocadojs.plugin.haptics'
})
export class Haptics extends Plugin {

  impact(options: HapticsImpactOptions) {
    this.nativeCallback('impact', options);
  }

  vibrate(options: VibrateOptions = {}) {
    this.nativeCallback('vibrate', options);
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


export interface HapticsImpactOptions {
  style: HapticsImpactStyle;
}

export enum HapticsImpactStyle {
  Heavy = 'HEAVY',
  Medium = 'MEDIUM',
  Light = 'LIGHT'
}
