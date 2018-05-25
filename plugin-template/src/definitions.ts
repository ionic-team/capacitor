declare global {
  interface PluginRegistry {
    Echo?: EchoPlugin;
  }
}

export interface EchoPlugin {
  echo(options: { value: string }): Promise<{value: string}>;
}
