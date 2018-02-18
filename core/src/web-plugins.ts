import { Plugins } from './global';
import { mergeWebPlugins, mergeWebPlugin, WebPlugin } from './web/index';

export * from './web/browser';
export * from './web/camera';
export * from './web/clipboard';
export * from './web/geolocation';
export * from './web/device';
export * from './web/share';
export * from './web/modals';

mergeWebPlugins(Plugins);

export const registerWebPlugin = (plugin: WebPlugin) => {
  mergeWebPlugin(Plugins, plugin);
}