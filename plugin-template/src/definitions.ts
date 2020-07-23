declare module '@capacitor/core' {
  interface PluginRegistry {
    MyPlugin: MyPluginPlugin;
  }
}

export interface MyPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
