import type { CapacitorGlobal } from '../definitions';
import type { WebPlugin } from '../web-plugin';

export const legacyRegisterWebPlugin = (
  cap: CapacitorGlobal,
  webPlugin: WebPlugin,
): void => {
  const config = webPlugin.config;
  const Plugins = cap.Plugins;

  if (!config?.name) {
    // TODO: add link to upgrade guide
    throw new Error(
      `Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."`,
    );
  }

  // TODO: add link to upgrade guide
  console.warn(
    `Capacitor plugin "${config.name}" is using the deprecated "registerWebPlugin()" function`,
  );

  if (!Plugins[config.name] || config?.platforms?.includes(cap.getPlatform())) {
    // Add the web plugin into the plugins registry if there already isn't
    // an existing one. If it doesn't already exist, that means
    // there's no existing native implementation for it.
    // - OR -
    // If we already have a plugin registered (meaning it was defined in the native layer),
    // then we should only overwrite it if the corresponding web plugin activates on
    // a certain platform. For example: Geolocation uses the WebPlugin on Android but not iOS
    Plugins[config.name] = webPlugin;
  }
};
