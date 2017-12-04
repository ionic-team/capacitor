import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Motion',
  id: 'com.avocadojs.plugin.motion'
})
export class Motion extends Plugin {

  watchAccel(callback: MotionWatchAccelCallback) {
    this.nativeCallback('watchAccel', callback);
  }

}


export interface MotionAccel {
  x: number;
  y: number;
  z: number;
}

export type MotionWatchAccelCallback = (err: any, accel: MotionAccel) => void;
