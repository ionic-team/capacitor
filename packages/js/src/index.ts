
// always import avocado so that it's placed on window
import './avocado';

export {
  PluginCallback,
  PluginResultData,
  PluginResultError,
  PluginConfig
} from './definitions';

export {
  Plugin, NativePlugin
} from './plugin';

export * from './plugins/index';
