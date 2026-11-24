import { EventEmitter } from 'events';
import { request } from 'https';

import { deliver } from '../src/ipc';
import type { Metric } from '../src/telemetry';

jest.mock('https', () => ({ request: jest.fn() }));

const mockedRequest = request as unknown as jest.Mock;

/**
 * Deliberately has no `setTimeout`. The deadline is an overall timer, not a
 * socket inactivity timer — reintroducing `req.setTimeout` would fail here
 * rather than silently stop bounding the connect phase.
 */
class FakeRequest extends EventEmitter {
  public body?: string;
  public destroyed = false;

  destroy(): this {
    this.destroyed = true;

    return this;
  }

  end(body: string): this {
    this.body = body;

    return this;
  }
}

class FakeResponse extends EventEmitter {
  public resumed = false;

  constructor(public statusCode: number) {
    super();
  }

  resume(): this {
    this.resumed = true;

    return this;
  }
}

const METRIC: Metric<string, unknown> = {
  name: 'capacitor_cli_command',
  timestamp: '2026-10-21T00:00:00.000Z',
  session_id: 'machine-1',
  source: 'capacitor_cli',
  value: { command: 'sync' },
};

function startDelivery(timeout?: number): {
  req: FakeRequest;
  promise: Promise<void>;
  respond: (response: FakeResponse) => void;
} {
  const req = new FakeRequest();
  let onResponse: (response: FakeResponse) => void = () => undefined;

  mockedRequest.mockImplementation((_options: unknown, handler: (response: FakeResponse) => void) => {
    onResponse = handler;

    return req;
  });

  const promise = deliver(METRIC, timeout);

  return { req, promise, respond: (response) => onResponse(response) };
}

describe('deliver', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('posts the metric to the events service', async () => {
    const { req, promise, respond } = startDelivery();
    const response = new FakeResponse(202);

    respond(response);
    response.emit('end');
    await promise;

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', path: '/metrics', port: 443 }),
      expect.any(Function),
    );
    expect(JSON.parse(req.body ?? '{}')).toEqual({ metrics: [METRIC], sent_at: expect.any(String) });
  });

  it('drains an accepted response so the socket can close', async () => {
    const { promise, respond } = startDelivery();
    const response = new FakeResponse(202);

    respond(response);
    response.emit('end');
    await promise;

    expect(response.resumed).toBe(true);
  });

  it('resolves on a rejected response rather than throwing', async () => {
    const { promise, respond } = startDelivery();
    const response = new FakeResponse(500);

    respond(response);
    response.emit('data', Buffer.from('nope'));
    response.emit('end');

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when the request errors', async () => {
    const { req, promise } = startDelivery();

    req.emit('error', new Error('socket hang up'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when reading the response fails midway', async () => {
    const { promise, respond } = startDelivery();
    const response = new FakeResponse(202);

    respond(response);
    response.emit('error', new Error('aborted'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves and destroys the socket when the deadline passes', async () => {
    jest.useFakeTimers();

    const { req, promise } = startDelivery(1500);

    jest.advanceTimersByTime(1500);

    await expect(promise).resolves.toBeUndefined();
    expect(req.destroyed).toBe(true);
  });

  // The deadline covers the connect phase too, which is the case a socket
  // inactivity timer misses entirely — nothing ever connects, so nothing ever
  // goes idle.
  it('bounds a request that never connects', async () => {
    jest.useFakeTimers();

    const { promise } = startDelivery(1500);

    jest.advanceTimersByTime(1499);
    expect(jest.getTimerCount()).toBe(1);

    jest.advanceTimersByTime(1);

    await expect(promise).resolves.toBeUndefined();
  });

  it('clears the deadline once the response lands, so a settled call is never torn down', async () => {
    jest.useFakeTimers();

    const { req, promise, respond } = startDelivery(1500);
    const response = new FakeResponse(202);

    respond(response);
    response.emit('end');
    await promise;

    expect(jest.getTimerCount()).toBe(0);

    jest.advanceTimersByTime(5000);

    expect(req.destroyed).toBe(false);
  });
});
