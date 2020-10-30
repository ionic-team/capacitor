import type { CapacitorInstance, GlobalInstance } from '../definitions';
import { createCapacitor } from '../runtime';

describe('legacy', () => {
  let instance: CapacitorInstance;
  let gbl: GlobalInstance;

  it('navigator.app.exitApp', () => {
    gbl = {
      navigator: {},
    };
    instance = createCapacitor(gbl);
    expect(gbl.navigator.app.exitApp).toBeDefined();
  });

  it('cordova global', () => {
    gbl = {};
    instance = createCapacitor(gbl);
    expect(gbl.cordova).toBeDefined();
  });

  it('use existing cordova global', () => {
    const existingCordova: any = {};
    gbl = {
      cordova: existingCordova,
    };
    instance = createCapacitor(gbl);
    expect(gbl.cordova).toBe(existingCordova);
  });

  it('deprecated props', () => {
    expect((instance as any).platform).toBe('web');
    expect((instance as any).isNative).toBe(false);
  });
});
