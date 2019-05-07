import { Plugins } from './global';
import { mergeWebPlugins, mergeWebPlugin, WebPlugin } from '@capacitor/core';

export * from './electron/clipboard';
export * from './electron/device';
export * from './electron/filesystem';
export * from './electron/modals';
export * from './electron/network';
export * from './electron/splashscreen';


mergeWebPlugins(Plugins);

export const registerElectronPlugin = (plugin: WebPlugin) => {
  mergeWebPlugin(Plugins, plugin);
};
