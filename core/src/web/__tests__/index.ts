import { WebPlugin } from '../index';

class MockPlugin extends WebPlugin {
  constructor() {
    super({name: 'Mock'});
  }
  trigger() {
    this.notifyListeners('test', {
      value: "Capacitors on top of toast!"
    });
  }
}

describe('Web Plugin', () => {
  var plugin: MockPlugin;

  beforeEach(() => {
    plugin = new MockPlugin();
  })

  it('Should add event listeners', () => {
    let lf = (event: any) => { console.log(event); };

    let handle = plugin.addListener('test', lf);

    const listener = plugin.listeners['test'];
    expect(listener).not.toBe(undefined);
    expect(listener.length).toEqual(1);
    handle.remove();
  });

  it('Should manage multiple event listeners', () => {
    let lf1 = (event: any) => { console.log(event); };
    let lf2 = (event: any) => { console.log(event); };
    let lf3 = (event: any) => { console.log(event); };
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
    let lf = (event: any) => { console.log(event); };
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
    expect(lf.mock.calls[0][0]).toEqual({ value: 'Capacitors on top of toast!' });
    handle.remove();
  });

  it('Should register and remove window listeners', () => {
    let pluginAddWindowListener = jest.spyOn(MockPlugin.prototype as any, 'addWindowListener');
    plugin.registerWindowListener('fake', 'test');

    let lf = jest.fn();
    let handle = plugin.addListener('test', lf);

    // Make sure the window listener was added
    let windowListener = plugin.windowListeners['test'];
    expect(windowListener.registered).toEqual(true);
    expect(pluginAddWindowListener.mock.calls.length).toEqual(1);

    // Trigger a custom window event
    var event = new CustomEvent('fake', { detail: { value: 'Capacitors on top of toast!' }});
    window.dispatchEvent(event);

    expect(lf.mock.calls.length).toEqual(1);

    const eventArg = lf.mock.calls[0][0];
    expect(eventArg.detail.value).toEqual('Capacitors on top of toast!');

    handle.remove();
    windowListener = plugin.windowListeners['test'];
    expect(windowListener.registered).toEqual(false);
  })

  it('Should only call window event if listeners bound', () => {
    plugin.registerWindowListener('fake', 'test');

    // Make sure the window listener was added
    const windowListener = plugin.windowListeners['test'];

    expect(windowListener.registered).toEqual(false);

    let handlerFunction = jest.spyOn(windowListener, 'handler');
    // Trigger a custom window event
    var event = new CustomEvent('fake', { detail: { value: 'Capacitors on top of toast!' }});
    window.dispatchEvent(event);

    expect(handlerFunction).not.toHaveBeenCalled();
  })
});