import { Capacitor } from './global';

export class PluginRegistry {
  protected readonly plugins: {
    readonly [plugin: string]: RegisteredPlugin<unknown>;
  };
}

export type RegisterPluginImplementations<T> = {
  readonly [platform: string]: T;
};

export class RegisteredPlugin<T> {
  constructor(readonly spec: RegisterPluginImplementations<T>) {}

  getImplementation(platform?: string): T | undefined {
    return this.spec[platform ? platform : Capacitor.platform];
  }
}

export const registerPlugin = <T>(
  spec: RegisterPluginImplementations<T>,
): RegisteredPlugin<T> => new RegisteredPlugin(spec);
