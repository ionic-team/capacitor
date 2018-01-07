import { Plugins } from './global';
import { mergeWebPlugins } from './web/index';

// Must be imported
//export * from './web/geolocation';
export * from './web/motion';

mergeWebPlugins(Plugins);
