import { WebPlugin } from './index';

import {
  MotionPlugin,
  /*
  MotionEventResult,
  MotionWatchAccelCallback,
  MotionWatchOrientationCallback,
  MotionOrientationEventResult
  */
} from '../core-plugin-definitions';

export class MotionPluginWeb extends WebPlugin implements MotionPlugin {
  constructor() {
    super({
      name: 'Motion'
    });
    this.registerWindowListener('devicemotion', 'accel');
    this.registerWindowListener('deviceorientation', 'orientation');
  }
}

const Motion = new MotionPluginWeb();

export { Motion };
