import { WebPlugin } from '../index';

class MockPlugin extends WebPlugin {
  constructor() {
    super("Mock");
  }
  trigger() {
    this.notifyListeners('test', {
      value: "Avocados on top of toast!"
    });
  }
}

describe('Web Plugin', () => {
  var plugin;

  beforeEach(() => {
    plugin = new MockPlugin();
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

  it('Should notify listeners', () => {
    let lf = jest.fn();
    let handle = plugin.addListener('test', lf);

    plugin.trigger();

    expect(lf.mock.calls.length).toEqual(1);
    expect(lf.mock.calls[0][0]).toEqual({ value: 'Avocados on top of toast!' })
  });

  it('Should register window listeners', () => {
    let pluginAddWindowListener = jest.spyOn(plugin, 'addWindowListener');

    plugin.registerWindowListener('fake', 'test');
    let lf = jest.fn();
    let handle = plugin.addListener('test', lf);

    const windowListener = plugin.windowListeners['test'];
    expect(windowListener.registered).toEqual(true);
    expect(windowListener).not.toBe(undefined);
    expect(pluginAddWindowListener.mock.calls.length).toEqual(1);

    console.log(windowListener);

    const windowHandler = jest.spyOn(windowListener, 'handler');
    var event = new CustomEvent('fake', {});
    window.dispatchEvent(event);
    expect(windowHandler).toHaveBeenCalled();

    expect(lf.mock.calls.length).toEqual(1);
    expect(lf.mock.calls[0][0]).toEqual({ value: 'Avocados on top of toast!' })
  })
});