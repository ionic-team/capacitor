import { WebPlugin } from './index';

import {
  MotionPlugin,
  MotionEventResult,
  MotionWatchAccelCallback,
  MotionWatchOrientationCallback, 
  MotionOrientationEventResult
} from '../core-plugin-definitions';

export class MotionPluginWeb implements MotionPlugin {
  watchOrientation(cb: MotionWatchOrientationCallback) {
    let watch = (event: MotionOrientationEventResult) => {
      cb(null, event);
    }

    window.addEventListener('deviceorientation', watch);

    return () => {
      window.removeEventListener('deviceorientation', watch);
    }
  }

  watchAccel(cb: MotionWatchAccelCallback) {
    let watch = (event: MotionEventResult) => {
      cb(null, event);
    }

    window.addEventListener('devicemotion', watch);

    return () => {
      window.removeEventListener('devicemotion', watch);
    }
  }
}

const Motion = new WebPlugin(
  "Motion",
  MotionPluginWeb
)

export { Motion };