import '../../../index';

declare module '../../../index' {
  interface PluginRegistry {
    Legacy: LegacyPlugin;
  }
}

export interface LegacyPlugin {
  getStatus(): Promise<string>;
}
