import { Plugins } from './global';
import { mergeWebPlugins, mergeWebPlugin, WebPlugin } from '@capacitor/core';

export * from '@capacitor/core/dist/esm/web/browser';
export * from '@capacitor/core/dist/esm/web/camera';
export * from '@capacitor/core/dist/esm/web/clipboard';
export * from '@capacitor/core/dist/esm/web/geolocation';
export * from '@capacitor/core/dist/esm/web/device';
export * from '@capacitor/core/dist/esm/web/share';
export * from '@capacitor/core/dist/esm/web/modals';
export * from '@capacitor/core/dist/esm/web/storage';
export * from './electron/filesystem';
export * from './electron/network';
export * from './electron/splashscreen';
export * from './electron/toast';


mergeWebPlugins(Plugins);

export const registerElectronPlugin = (plugin: WebPlugin) => {
  mergeWebPlugin(Plugins, plugin);
};