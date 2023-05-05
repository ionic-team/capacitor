/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { CapacitorException, ExceptionCode } from './util';

export function CapPlugin(pluginName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      pluginName = pluginName;
    };
  };
}

export function PluginMethod(
  // @ts-ignore
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>
): TypedPropertyDescriptor<any> {
  // Check if the decorator is being used on a method.
  if (!propertyKey || !descriptor || typeof descriptor.value !== 'function') {
    throw new Error('The @PluginMethod decorator can only be used on methods.');
  }

  // Store a reference to the original method.
  const originalMethod = descriptor.value;

  // Get the original function's name as a string.
  const functionPropertyKey = propertyKey;

  // Modify the descriptor's value (the method implementation) to add the desired behavior.
  descriptor.value = function (...args: any[]) {
    // If in native land, use correct native caller.
    if ((window as any).Capacitor.isNativePlatform() === true) {
      const plginName = this.pluginName;
      const [passedArgs] = args;

      const pluginHeader = (window as any).Capacitor.PluginHeaders?.find((h: any) => h.name === plginName);

      let methodDescriptor: any;
      let isPromiseMethod = false;

      if (pluginHeader) {
        const methodHeader = pluginHeader?.methods.find((m: any) => functionPropertyKey === m.name);
        if (methodHeader) {
          if (methodHeader.rtype === 'promise') {
            isPromiseMethod = true;
            methodDescriptor = (window as any).Capacitor.nativePromise;
          } else {
            methodDescriptor = (window as any).Capacitor.nativeCallback
          }
        } else {
          throw new CapacitorException(
            `"${functionPropertyKey.toString()}" method is not implemented in ${plginName} on ${(window as any).Capacitor.platform}`,
            ExceptionCode.Unimplemented,
          );
        }
      } else {
        throw new CapacitorException(
          `"${plginName}" plugin is not implemented on ${(window as any).Capacitor.platform}`,
          ExceptionCode.Unimplemented,
        );
      }

      if (isPromiseMethod) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          try {
            const res = await methodDescriptor(plginName, functionPropertyKey.toString(), passedArgs);
            resolve(res);
          } catch (e) {
            reject(e);
          }
        });
      } else {
        return methodDescriptor(plginName, functionPropertyKey.toString(), passedArgs['options'], passedArgs['callback']);
      }
    } else {
      // If not in native land, call the original method with the provided arguments.
      return originalMethod.apply(this, args);
    }
  };

  // Return the modified descriptor.
  return descriptor;
}

