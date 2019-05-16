import { Plugins } from './global';
import { mergeWebPlugins, mergeWebPlugin, WebPlugin } from './web/index';

export * from './web/accessibility';
export * from './web/browser';
export * from './web/camera';
export * from './web/clipboard';
export * from './web/filesystem';
export * from './web/geolocation';
export * from './web/device';
export * from './web/share';
export * from './web/modals';
export * from './web/motion';
export * from './web/storage';
export * from './web/toast';

mergeWebPlugins(Plugins);

export const registerWebPlugin = (plugin: WebPlugin) => {
  mergeWebPlugin(Plugins, plugin);
};
