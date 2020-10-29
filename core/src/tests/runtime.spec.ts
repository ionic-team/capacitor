import type { CapacitorInstance, GlobalInstance } from '../definitions';
import { createCapacitor } from '../runtime';

describe('runtime', () => {
  let instance: CapacitorInstance;
  let gbl: GlobalInstance;

  beforeEach(() => {
    gbl = {};
    instance = createCapacitor(gbl);
  });

  it('default methods/props', () => {
    expect(instance.getPlatform()).toBe('web');
    expect(instance.isNativePlatform()).toBe(false);
    expect(instance.isPluginAvailable('Nope')).toBe(false);
    expect(instance.DEBUG).toBe(undefined);
  });
});
