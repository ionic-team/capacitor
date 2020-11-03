export interface NetworkPlugin {
  getStatus(): Promise<string>;
}
