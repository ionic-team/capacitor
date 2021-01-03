import { WebPlugin } from '../web-plugin';

class MockPlugin extends WebPlugin {
  trigger() {
    this.notifyListeners('test', {
      value: 'Capacitors on top of toast!',
    });
  }
}

describe('Web Plugin', () => {
  let plugin: MockPlugin;

  beforeEach(() => {
    plugin = new MockPlugin();
  });

  it('Should add event listeners', () => {
    const lf = (event: any) => {
      console.log(event);
    };

    const handle = plugin.addListener('test', lf);

    const listener = plugin.listeners['test'];
    expect(listener).not.toBe(undefined);
    expect(listener.length).toEqual(1);
    handle.remove();
  });

  it('Should manage multiple event listeners', () => {
    const lf1 = (event: any) => {
      console.log(event);
    };
    const lf2 = (event: any) => {
      console.log(event);
    };
    const lf3 = (event: any) => {
      console.log(event);
    };
    const handle1 = plugin.addListener('test', lf1);
    const handle2 = plugin.addListener('test', lf2);
    const handle3 = plugin.addListener('test', lf3);

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
    const lf = (event: any) => {
      console.log(event);
    };
    const handle = plugin.addListener('test', lf);
    handle.remove();

    const listener = plugin.listeners['test'];
    expect(listener).toEqual([]);
  });

  it('Should notify listeners', () => {
    const lf = jest.fn();
    const handle = plugin.addListener('test', lf);

    plugin.trigger();

    expect(lf.mock.calls.length).toEqual(1);
    expect(lf.mock.calls[0][0]).toEqual({
      value: 'Capacitors on top of toast!',
    });
    handle.remove();
  });

  it('Should register and remove window listeners', () => {
    const pluginAddWindowListener = jest.spyOn(
      MockPlugin.prototype as any,
      'addWindowListener',
    );
    plugin.registerWindowListener('fake', 'test');

    const lf = jest.fn();
    const handle = plugin.addListener('test', lf);

    // Make sure the window listener was added
    let windowListener = plugin.windowListeners['test'];
    expect(windowListener.registered).toEqual(true);
    expect(pluginAddWindowListener.mock.calls.length).toEqual(1);

    // Trigger a custom window event
    const event = new CustomEvent('fake', {
      detail: { value: 'Capacitors on top of toast!' },
    });
    window.dispatchEvent(event);

    expect(lf.mock.calls.length).toEqual(1);

    const eventArg = lf.mock.calls[0][0];
    expect(eventArg.detail.value).toEqual('Capacitors on top of toast!');

    handle.remove();
    windowListener = plugin.windowListeners['test'];
    expect(windowListener.registered).toEqual(false);
  });

  it('Should only call window event if listeners bound', () => {
    plugin.registerWindowListener('fake', 'test');

    // Make sure the window listener was added
    const windowListener = plugin.windowListeners['test'];

    expect(windowListener.registered).toEqual(false);

    const handlerFunction = jest.spyOn(windowListener, 'handler');
    // Trigger a custom window event
    const event = new CustomEvent('fake', {
      detail: { value: 'Capacitors on top of toast!' },
    });
    window.dispatchEvent(event);

    expect(handlerFunction).not.toHaveBeenCalled();
  });
});
