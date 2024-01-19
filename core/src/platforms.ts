import type { PluginImplementations } from './definitions';
import type { PluginHeader } from './definitions-internal';

export interface CapacitorPlatform {
  name: string;
  getPlatform?(): string;
  isPluginAvailable?(pluginName: string): boolean;
  getPluginHeader?(pluginName: string): PluginHeader | undefined;
  registerPlugin?(
    pluginName: string,
    jsImplementations: PluginImplementations,
  ): any;
  isNativePlatform?(): boolean;
}

export interface CapacitorPlatformsInstance {
  currentPlatform: CapacitorPlatform;
  platforms: Map<string, CapacitorPlatform>;
  addPlatform(name: string, platform: CapacitorPlatform): void;
  setPlatform(name: string): void;
}

const createCapacitorPlatforms = (win: any): CapacitorPlatformsInstance => {
  const defaultPlatformMap = new Map<string, CapacitorPlatform>();
  defaultPlatformMap.set('web', { name: 'web' });

  const capPlatforms: CapacitorPlatformsInstance = win.CapacitorPlatforms || {
    currentPlatform: { name: 'web' },
    platforms: defaultPlatformMap,
  };

  const addPlatform = (name: string, platform: CapacitorPlatform) => {
    capPlatforms.platforms.set(name, platform);
  };

  const setPlatform = (name: string) => {
    if (capPlatforms.platforms.has(name)) {
      capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
    }
  };

  capPlatforms.addPlatform = addPlatform;
  capPlatforms.setPlatform = setPlatform;

  return capPlatforms;
};

const initPlatforms = (win: any) =>
  (win.CapacitorPlatforms = createCapacitorPlatforms(win));

/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
export const CapacitorPlatforms = /*#__PURE__*/ initPlatforms(
  (typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : {}) as any,
);
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
export const addPlatform = CapacitorPlatforms.addPlatform;
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
export const setPlatform = CapacitorPlatforms.setPlatform;
