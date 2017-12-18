import { WebPlugin } from '../index';

describe('Web Plugin', () => {
  var plugin;

  beforeEach(() => {
    plugin = new WebPlugin("Test");
  })

  it('Should add event listeners', () => {
    let lf = (event) => {};

    let handle = plugin.addListener('test', lf);

    const listener = plugin.listeners['test'];
    expect(listener).not.toBe(undefined);
    expect(listener.length).toEqual(1);
  });

  it('Should manage multiple event listeners', () => {
    let lf1 = (event) => {};
    let lf2 = (event) => {};
    let lf3 = (event) => {};
    let handle1 = plugin.addListener('test', lf1);
    let handle2 = plugin.addListener('test', lf2);
    let handle3 = plugin.addListener('test', lf3);

    const listener = plugin.listeners['test'];
    expect(listener.length).toEqual(3);
    handle1.remove();
    expect(listener.length).toEqual(2);
    handle2.remove();
    expect(listener.length).toEqual(1);
    handle3.remove();
    expect(listener.length).toEqual(0);
  });

  it('Should remove event listeners', () => {
    let lf = (event) => {};
    let handle = plugin.addListener('test', lf);
    handle.remove();

    const listener = plugin.listeners['test'];
    expect(listener).toEqual([]);
  });

  it('Should add window event listeners', () => {
  });
});