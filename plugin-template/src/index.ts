import {
  Plugins,
  PluginImplementations,
  registerPlugin,
} from '@capacitor/core';

import { MyPluginPlugin } from './definitions';
import { MyPluginWeb } from './web';

const implementations: PluginImplementations<MyPluginPlugin> = {
  android: Plugins.MyPlugin,
  ios: Plugins.MyPlugin,
  web: new MyPluginWeb(),
};

const MyPlugin = registerPlugin(
  'MyPlugin',
  implementations,
).getImplementation();

export { MyPlugin };
