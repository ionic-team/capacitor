import type { InternalState, PluginImplementations } from './definitions';

export const initPluginRegistry = (state: InternalState) => {
  const plugins = new Map();

  const registerPlugin = (
    pluginName: string,
    implementations: Readonly<PluginImplementations<unknown>>,
  ): any => {
    const registeredPlugin = createRegisteredPlugin(
      state.platform,
      pluginName,
      implementations,
    );
    plugins.set(pluginName, registeredPlugin);
    return registeredPlugin;
  };
  return registerPlugin;
};

const createRegisteredPlugin = (
  platform: string,
  pluginName: string,
  implementations: Readonly<PluginImplementations<unknown>>,
) => {
  const implementation = implementations[platform];

  if (!implementation) {
    // Degraded experience for non-Proxy environments, e.g. IE11.
    if (typeof Proxy === 'undefined') {
      return;
    }
    return new Proxy(
      {},
      {
        get(_target, prop) {
          throw new Error(
            `${pluginName} does not have an implementation for ${
              prop as string
            }.`,
          );
        },
      },
    );
  }

  return implementation;
};

// class RegisteredPlugin333<T> {
//   constructor(
//     readonly name: string,
//     readonly implementations: Readonly<PluginImplementations<T>>,
//   ) {}

//   /**
//    * Return the appropriate implementation of this plugin.
//    *
//    * Supply a platform to return the implementation for it, otherwise this
//    * method will return the implementation for the current platform as detected
//    * by Capacitor.
//    *
//    * If an implementation for the specified platform does not exist, a mock
//    * implementation is returned which throws 'unimplemented' errors for every
//    * method call and property access.
//    *
//    * @param platform Optionally return the implementation of the given
//    *                 platform.
//    */
//   getImplementation(platform: string = Capacitor.platform): T {
//     const implementation = this.implementations[platform];

//     if (!implementation) {
//       // Degraded experience for non-Proxy environments, e.g. IE11.
//       if (typeof Proxy === 'undefined') {
//         return;
//       }

//       return new Proxy({}, this.createImplementationProxyHandler(platform));
//     }

//     return implementation;
//   }

//   protected createImplementationProxyHandler(
//     platform: string,
//   ): ProxyHandler<any> {
//     return {
//       get: () => {
//         throw new Error(
//           `${this.name} does not have an implementation for ${platform}.`,
//         );
//       },
//     };
//   }
// }
