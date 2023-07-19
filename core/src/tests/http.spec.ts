/**
 * @jest-environment jsdom
 */

import 'isomorphic-fetch';
import { initBridge } from '../../native-bridge';
import { MessageCallData, PluginResult, WindowCapacitor } from '../definitions-internal';

const createMockResponse = (win: WindowCapacitor, response: Partial<PluginResult> = {}) => (m: string) => {
  const data: MessageCallData = JSON.parse(m);
  const result = {
    callbackId: data.callbackId,
    methodName: data.methodName,
    pluginId: data.pluginId,
    success: true,
    data: {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        test: 'value',
      },
      status: 200,
    },
    ...response,
  };

  setTimeout(() => {
    if (result.success) {
      win.androidBridge.onmessage({data: JSON.stringify(result)});
    } else {
      win.androidBridge.onmessage({data: JSON.stringify(result)});
    }
  });
};

describe('http', () => {
  let win: WindowCapacitor;
  const testFile = new File(['foo'], 'foo.txt', { type: 'text/plain' });
  const testFileBase64 = 'Zm9v';

  describe('android', () => {
    let mockPostMessage: jest.Mock<void, [string]>;

    beforeEach(() => {
      mockPostMessage = jest.fn();

      win = {
        androidBridge: {
          postMessage: mockPostMessage,
        },
        CapacitorHttpAndroidInterface: {
          isEnabled: () => true,
        },
      };

      initBridge(win);
    });

    describe('fetch', () => {
      it('makes a basic request', async () => {
        mockPostMessage.mockImplementation(createMockResponse(win));

        const response = await win.fetch('https://www.example.com/test');

        expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
          callbackId: expect.any(String),
          pluginId: 'CapacitorHttp',
          methodName: 'request',
          options: {
            url: 'https://www.example.com/test',
            dataType: 'json',
            headers: {},
          },
        });

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/json');
        expect(body).toStrictEqual({ test: 'value' });
      });

      it('makes a basic request where the response content type is lower case', async () => {
        mockPostMessage.mockImplementation(createMockResponse(win, {
          data: {
            headers: {
              'content-type': 'application/json',
            },
            data: {
              test: 'value',
            },
            status: 200,
          },
        }));

        const response = await win.fetch('https://www.example.com/test');
        const body = await response.json();

        expect(body).toStrictEqual({ test: 'value' });
      });

      it('handles plain text responses', async () => {
        mockPostMessage.mockImplementation(createMockResponse(win, {
          data: {
            headers: {
              'Content-Type': 'text/plain',
            },
            data: 'I am a plain response',
            status: 200,
          },
        }));

        const response = await win.fetch('https://www.example.com/test');
        const body = await response.text();

        expect(body).toStrictEqual('I am a plain response');
      });

      it('handles error responses', async () => {
        mockPostMessage.mockImplementation(createMockResponse(win, {
          data: {
            headers: {
              'Content-Type': 'text/plain',
            },
            data: 'I am a plain response',
            status: 500,
          },
        }));

        const response = await win.fetch('https://www.example.com/test');
        const body = await response.text();

        expect(body).toStrictEqual('I am a plain response');
        expect(response.status).toBe(500);
      });

      describe('request bodies', () => {
        it('posts json', async () => {
          mockPostMessage.mockImplementation(createMockResponse(win, {
            data: {
              headers: {
                'Content-Type': 'application/json',
              },
              data: {
                test: 'value',
              },
              status: 200,
            },
          }));

          const response = await win.fetch('https://www.example.com/test', {
            method: 'POST',
            body: JSON.stringify({ key: 'value' }),
          });
          const body = await response.json();

          expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
            callbackId: expect.any(String),
            pluginId: 'CapacitorHttp',
            methodName: 'request',
            options: {
              url: 'https://www.example.com/test',
              method: 'POST',
              data: JSON.stringify({ key: 'value' }),
              dataType: 'json',
              headers: {},
            },
          });

          expect(body).toStrictEqual({ test: 'value' });
        });

        it('handles file objects as the request body', async () => {
          mockPostMessage.mockImplementation(createMockResponse(win, {
            data: {
              headers: {
                'Content-Type': 'application/json',
              },
              data: {
                test: 'value',
              },
              status: 200,
            },
          }));

          const response = await win.fetch('https://www.example.com/test', {
            method: 'POST',
            body: testFile,
          });
          const body = await response.json();

          expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
            callbackId: expect.any(String),
            pluginId: 'CapacitorHttp',
            methodName: 'request',
            options: {
              url: 'https://www.example.com/test',
              method: 'POST',
              data: testFileBase64,
              dataType: 'file',
              headers: {
                'Content-Type': 'text/plain',
              },
            },
          });

          expect(body).toStrictEqual({ test: 'value' });
        });

        it('handles FormData objects as the request body', async () => {
          mockPostMessage.mockImplementation(createMockResponse(win, {
            data: {
              headers: {
                'Content-Type': 'application/json',
              },
              status: 200,
            },
          }));

          const formData = new FormData();
          formData.append('key1', 'value1');
          formData.append('key2', 'value2');

          await win.fetch('https://www.example.com/test', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });

          expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
            callbackId: expect.any(String),
            pluginId: 'CapacitorHttp',
            methodName: 'request',
            options: {
              url: 'https://www.example.com/test',
              method: 'POST',
              data: [
                {
                  key: 'key1',
                  type: 'string',
                  value: 'value1',
                },
                {
                  key: 'key2',
                  type: 'string',
                  value: 'value2',
                }
              ],
              dataType: 'formData',
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          });
        });

        it('handles FormData objects with files as the request body', async () => {
          mockPostMessage.mockImplementation(createMockResponse(win, {
            data: {
              headers: {
                'Content-Type': 'application/json',
              },
              status: 200,
            },
          }));

          const formData = new FormData();
          formData.append('key1', 'value1');
          formData.append('key2', testFile, 'filename.txt');

          await win.fetch('https://www.example.com/test', {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });

          expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
            callbackId: expect.any(String),
            pluginId: 'CapacitorHttp',
            methodName: 'request',
            options: {
              url: 'https://www.example.com/test',
              method: 'POST',
              data: [
                {
                  key: 'key1',
                  type: 'string',
                  value: 'value1',
                },
                {
                  key: 'key2',
                  type: 'base64File',
                  value: testFileBase64,
                  contentType: 'text/plain',
                  fileName: 'filename.txt',
                }
              ],
              dataType: 'formData',
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          });
        });
      });
    });

    describe('XMLHttpRequest', () => {
      it('makes an XMLHttpRequest', (done) => {
        mockPostMessage.mockImplementation(createMockResponse(win));

        const req = new win.XMLHttpRequest();
        req.addEventListener('load', function()  {
          expect(this.responseText).toStrictEqual('{"test":"value"}');
          expect(this.status).toBe(200);
          expect(this.getResponseHeader('Content-Type')).toBe('application/json');

          expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
            callbackId: expect.any(String),
            pluginId: 'CapacitorHttp',
            methodName: 'request',
            options: {
              url: 'https://www.example.com/test',
              method: 'GET',
              dataType: 'json',
              headers: {
                'x-test-header': 'something',
              },
            },
          });

          done();
        });
        req.open('GET', 'https://www.example.com/test');
        req.setRequestHeader('x-test-header', 'something');
        req.send();
      });

      it('handles errors', (done) => {
        mockPostMessage.mockImplementation(createMockResponse(win, {
          error: {
            message: '',
            // @ts-ignore
            status: 500,
          },
          success: false,
        }));

        const req = new win.XMLHttpRequest();
        req.addEventListener('load', () => done('did not expect XMLHttpRequest to fire done event'));
        req.addEventListener('error', function()  {
          expect(this.status).toBe(500);

          done();
        });
        req.open('GET', 'https://www.example.com/test');
        req.setRequestHeader('x-test-header', 'something');
        req.send();
      });

      describe('request bodies', () => {
        it('makes an XMLHttpRequest with a file', (done) => {
          mockPostMessage.mockImplementation(createMockResponse(win));

          const req = new win.XMLHttpRequest();
          req.addEventListener('load', function () {
            expect(JSON.parse(mockPostMessage.mock.lastCall[0])).toStrictEqual({
              callbackId: expect.any(String),
              pluginId: 'CapacitorHttp',
              methodName: 'request',
              options: {
                url: 'https://www.example.com/test',
                method: 'POST',
                data: testFileBase64,
                dataType: 'file',
                headers: {
                  'Content-Type': 'text/plain',
                },
              },
            });

            done();
          });
          req.open('POST', 'https://www.example.com/test');
          req.send(testFile);
        });
      });
    });
  });
});
