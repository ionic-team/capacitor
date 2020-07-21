import { Capacitor } from './global';
import { WebPlugin } from './web';

const PLUGIN_REGISTRY = new (class {
  protected readonly plugins: {
    [plugin: string]: RegisteredPlugin<unknown>;
  } = {};

  get(name: string): RegisteredPlugin<unknown> | undefined {
    return this.plugins[name];
  }

  register(plugin: RegisteredPlugin<unknown>): void {
    this.plugins[plugin.name] = plugin;
  }
})();

/**
 * A map of plugin implementations.
 *
 * Each key should be the lowercased platform name as recognized by Capacitor,
 * e.g. 'android', 'ios', and 'web'. Each value must be an instance of a plugin
 * implementation for the respective platform.
 */
export type RegisterPluginImplementations<T> = {
  readonly [platform: string]: T;
};

/**
 * Represents a plugin registered with Capacitor.
 */
export class RegisteredPlugin<T> {
  constructor(
    readonly name: string,
    readonly implementations: RegisterPluginImplementations<T>,
  ) {}

  /**
   * Return the appropriate implementation of this plugin.
   *
   * Supply a platform to return the implementation for it, otherwise this
   * method will return the implementation for the current platform as detected
   * by Capacitor.
   *
   * @param platform Optionally return the implementation of the given
   *                 platform.
   */
  getImplementation(platform?: string): T | undefined {
    return this.implementations[platform ? platform : Capacitor.platform];
  }
}

/**
 * Register plugin implementations with Capacitor.
 *
 * This function will create and register an instance that contains the
 * implementations of the plugin.
 *
 * Each plugin has multiple implementations, one per platform. Each
 * implementation must adhere to a common interface to ensure client code
 * behaves consistently across each platform.
 *
 * @param name The unique CamelCase name of this plugin.
 * @param implementations The map of plugin implementations.
 */
export const registerPlugin = <T>(
  name: string,
  implementations: RegisterPluginImplementations<T>,
): RegisteredPlugin<T> => {
  const plugin = new RegisteredPlugin(name, implementations);
  PLUGIN_REGISTRY.register(plugin);

  return plugin;
};

/**
 * TODO
 *
 * @deprecated Don't use this.
 */
export const registerWebPlugin = (plugin: WebPlugin) => {
  console.warn(
    `Capacitor plugin ${plugin.config.name} is using deprecated method 'registerWebPlugin'`,
  ); // TODO: add link to upgrade guide
};
