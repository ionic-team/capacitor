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

    const uaFields = this.parseUa(ua);

    let battery: any = {};

    try {
      battery = await navigator.getBattery();
    } catch (e) {
      // Let it fail, we don't care
    }

    return Promise.resolve({
      model: uaFields.model,
      platform: "pwa",
      appVersion: '',
      osVersion: uaFields.osVersion,
      manufacturer: navigator.vendor,
      isVirtual: false,
      batteryLevel: battery.level,
      isCharging: battery.charging,
      uuid: this.getUid()
    });
  }

  parseUa(_ua: string) {
    let uaFields: any = {};
    const start = _ua.indexOf('(')+1;
    const end = _ua.indexOf('Apple')-2;
    const fields = _ua.substring(start, end);
    if (_ua.indexOf('Android') !== -1) {
      uaFields.model = fields.replace(" wv", "").split("; ").pop().split(' Build')[0];
      uaFields.osVersion = fields.split('; ')[1];
    } else {
      uaFields.model = fields.split('; ')[0];
      uaFields.osVersion = navigator.oscpu ? navigator.oscpu : fields.split('; ').pop().split(" ")[3].replace(/_/g, ".");
    }

    return uaFields;
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
