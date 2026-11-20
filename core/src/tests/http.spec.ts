/**
 * @jest-environment jsdom
 */

import { CapacitorHttpPluginWeb } from '../core-plugins';

describe('CapacitorHttpPluginWeb', () => {
  const originalFetch = (globalThis as any).fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      url,
      headers: {
        get: () => 'text/plain',
        forEach: () => undefined,
      },
      text: async () => 'ok',
    }));
    (globalThis as any).fetch = fetchMock;
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
  });

  it('appends params to a url without a query string', async () => {
    const http = new CapacitorHttpPluginWeb();
    await http.get({ url: 'https://example.com/api', params: { b: '2' } });

    expect(fetchMock.mock.calls[0][0]).toEqual('https://example.com/api?b=2');
  });

  it('keeps the existing query string when adding params', async () => {
    const http = new CapacitorHttpPluginWeb();
    await http.get({ url: 'https://example.com/api?a=1', params: { b: '2' } });

    expect(fetchMock.mock.calls[0][0]).toEqual('https://example.com/api?a=1&b=2');
  });
});
