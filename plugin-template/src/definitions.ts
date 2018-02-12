declare global {
  interface PluginRegistry {
    EchoPlugin?: EchoPlugin;
  }
}

export interface EchoPlugin {
  echo(options: { value: string }): Promise<{value: string}>;
}
