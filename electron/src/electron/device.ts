import { DeviceInfo, DeviceLanguageCodeResult, DevicePlugin, DevicePluginWeb,  WebPlugin } from "@capacitor/core";

declare var navigator: any;
const webDevice = new DevicePluginWeb();

export class DevicePluginElectron extends WebPlugin implements DevicePlugin {
  constructor() {
    super({
      name: 'Device',
      platforms: ['electron']
    });
  }

  async getInfo(): Promise<DeviceInfo> {
    var info = await webDevice.getInfo();
    
    return {
      model: info.model,
      platform: <'electron'> 'electron',
      appVersion: '',
      appBuild: '',
      osVersion: info.osVersion,
      manufacturer: navigator.vendor,
      isVirtual: false,
      batteryLevel: info.batteryLevel,
      isCharging: info.isCharging,
      uuid: info.uuid
    };
  }

  async getLanguageCode(): Promise<DeviceLanguageCodeResult> {
    return webDevice.getLanguageCode();
  }

}
    
const Device = new DevicePluginElectron();

export { Device };
