import { WebPlugin } from './index';

import {
  DeviceInfo,
  DevicePlugin
} from '../core-plugin-definitions';

import { uuid4 } from '../util';

declare var navigator: any;

export class DevicePluginWeb extends WebPlugin implements DevicePlugin {
  constructor() {
    super({
      name: 'Device',
      platforms: ['web']
    });
  }

  async getInfo(): Promise<DeviceInfo> {
    const ua = navigator.userAgent;

    console.log(ua);

    // const uaFields = this.parseUa(ua);

    let battery: any = {};

    try {
      battery = await navigator.getBattery();
    } catch (e) {
      // Let it fail, we don't care
    }

    return Promise.resolve({
      model: 'web',
      platform: 'web',
      appVersion: '',
      osVersion: '',
      manufacturer: '',
      isVirtual: false,
      batteryLevel: battery.level,
      isCharging: battery.charging,
      uuid: this.getUid()
    });
  }

  parseUa(_ua: string) {
    return {};
  }

  getUid() {
    let uid = window.localStorage.getItem('_capuid');
    if (uid) {
      return uid;
    }

    uid = uuid4();
    window.localStorage.setItem('_capuid', uid);
    return uid;
  }
}

const Device = new DevicePluginWeb();

export { Device };
