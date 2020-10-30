import type {
  CapacitorInstance,
  InternalState,
  Plugin,
  PluginCallback,
  PluginImplementations,
  PluginListenerHandle,
} from './definitions';
import { noop } from './util';

export const initPluginProxy = (
  instance: CapacitorInstance,
  state: InternalState,
): void => {
  // Gracefully degrade in non-Proxy supporting engines, e.g. IE11. This
  // effectively means that trying to access an unavailable plugin will
  // locally throw, but this is still better than throwing a syntax error.
  if (typeof Proxy !== 'undefined') {
    // Build a proxy for the Plugins object that returns the "Noop Plugin"
    // if a plugin isn't available
    instance.Plugins = new Proxy<any>(state.plugins, {
      get(plugins, pluginName) {
        if (typeof plugins[pluginName] === 'undefined') {
          return new Proxy<any>(
            {},
            {
              get(target, prop) {
                if (typeof target[prop] === 'undefined') {
                  return instance.pluginMethodNoop(target, prop, pluginName);
                }
                pluginName;
                return target[prop];
              },
            },
          );
        }
        return plugins[pluginName];
      },
    });
  }
};

export const initPluginRegister = (
  instance: CapacitorInstance,
  state: InternalState,
): void => {
  if (typeof Proxy === 'undefined') {
    instance.registerPlugin = noop as any;
    return;
  }

  instance.registerPlugin = (
    pluginName: string,
    implementations: PluginImplementations,
  ): any => {
    const plugin = createPlugin(instance, state, pluginName, implementations);
    state.plugins[pluginName] = plugin;
    return plugin;
  };
};

const createPlugin = (
  instance: CapacitorInstance,
  state: InternalState,
  pluginName: string,
  implementations: PluginImplementations,
): Plugin => {
  const listenerHandles: PluginListenerHandle[] = [];
  return new Proxy<any>(
    {},
    {
      get(_, prop) {
        // proxy getter for any call on this plugin object

        if (prop === 'addListener') {
          // Plugin.addListener()
          // does not return a promise
          return (eventName: string, callback: PluginCallback) => {
            const listenerHandle = instance.addListener(
              pluginName,
              eventName,
              callback,
            );
            listenerHandles.push(listenerHandle);
            return listenerHandle;
          };
        }

        if (prop === 'removeAllListeners') {
          // Plugin.removeAllListeners()
          // does not return a promise
          return () => {
            listenerHandles.forEach(h => h.remove());
            listenerHandles.length = 0;
          };
        }

        const impl = implementations[state.platform];
        if (impl) {
          if (typeof impl === 'function') {
            // implementation loader fn returning a promise
            // probably something like () => import('./web.js')
            return (...args: any[]) => {
              // begin lazy load the platform's implementation module
              return impl().then((loadedImpl: any) => {
                // platform implementation now loaded
                // replace the implementation loader fn w/ the loaded module
                implementations[state.platform] = loadedImpl;
                if (typeof (loadedImpl as any)[prop] === 'function') {
                  return (loadedImpl as any)[prop].apply(loadedImpl, args);
                }
                throw new instance.Exception(
                  `"${pluginName}" plugin implementation missing "${
                    prop as any
                  }"`,
                );
              });
            };
          }

          // platform implementation already loaded and module ready to go
          return (...args: any[]) => {
            if (typeof (impl as any)[prop] === 'function') {
              // call the plugin method, Plugin.method(args)
              return (impl as any)[prop].apply(impl, args);
            }
            throw new instance.Exception(
              `"${pluginName}" plugin implementation missing "${prop as any}"`,
            );
          };
        }

        throw new instance.Exception(
          `"${pluginName}" plugin implementation not available for "${state.platform}"`,
        );
      },
    },
  );
};
