export class CapacitorWeb {
  Plugins = {};
  platform = 'web';
  isNative = false;

  getPlatform() {
    return this.platform;
  }

  hasPlugin(name: string) {
    return this.Plugins.hasOwnProperty(name);
  }
}