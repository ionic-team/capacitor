import { Plugins, registerPlugin } from '@capacitor/core';
import { MyPluginWeb } from './web';

const MyPlugin = registerPlugin('ScreenReader', {
  android: Plugins.MyPlugin,
  ios: Plugins.MyPlugin,
  web: new MyPluginWeb(),
}).getImplementation();

export { MyPlugin };
