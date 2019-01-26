import { Plugins } from './global';
import { mergeWebPlugins, mergeWebPlugin, WebPlugin } from '@capacitor/core';

export * from './electron/filesystem';
export * from './electron/network';
export * from './electron/splashscreen';
export * from './electron/clipboard';
export * from './electron/modals';

mergeWebPlugins(Plugins);

export const registerElectronPlugin = (plugin: WebPlugin) => {
  mergeWebPlugin(Plugins, plugin);
};
