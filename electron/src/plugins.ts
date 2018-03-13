import { Plugins } from './global';
import { mergeWebPlugins, mergeWebPlugin, WebPlugin } from '../../core/src/web/index';

export * from '../../core/src/web/browser';
export * from '../../core/src/web/camera';
export * from '../../core/src/web/clipboard';
export * from '../../core/src/web/geolocation';
export * from '../../core/src/web/device';
export * from '../../core/src/web/share';
export * from '../../core/src/web/modals';
export * from '../../core/src/web/storage';
export * from './electron/filesystem';

mergeWebPlugins(Plugins);

export const registerElectronPlugin = (plugin: WebPlugin) => {
  mergeWebPlugin(Plugins, plugin);
};