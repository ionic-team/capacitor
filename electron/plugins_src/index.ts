import { mergeWebPlugins, Plugins } from '@capacitor/core';

export * from './filesystem';

mergeWebPlugins(Plugins);