import * as util from 'util';

import chalk from 'chalk';
import * as superagentType from 'superagent';

import { readFileAsync } from './fs';

const FORMAT_ERROR_BODY_MAX_LENGTH = 1000;
export const CONTENT_TYPE_JSON = 'application/json';

export const ERROR_UNKNOWN_CONTENT_TYPE = 'UNKNOWN_CONTENT_TYPE';
export const ERROR_UNKNOWN_RESPONSE_FORMAT = 'UNKNOWN_RESPONSE_FORMAT';

let CAS: string[] | undefined;
let CERTS: string[] | undefined;
let KEYS: string[] | undefined;

export function getGlobalProxy(): any {
  const envvars = ['IONIC_HTTP_PROXY', 'HTTPS_PROXY', 'HTTP_PROXY', 'PROXY', 'https_proxy', 'http_proxy', 'proxy'];

  for (const envvar of envvars) {
    if (process.env[envvar]) {
      return [process.env[envvar], envvar];
    }
  }

  return [undefined, undefined];
}

export async function createRawRequest(method: string, url: string): Promise<any> {
  const superagent = await import('superagent');

  try {
    const superagentProxy = await import('superagent-proxy');
    superagentProxy(superagent);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    }
  }

  return { req: superagent(method, url) };
}

export async function createRequest(method: string, url: string): Promise<any> {
  const [ proxy ] = getGlobalProxy();

  const { req } = await createRawRequest(method, url);

  if (proxy && req.proxy) {
    req.proxy(proxy);
  }

  return { req };
}

export async function download(url: string, ws: NodeJS.WritableStream, opts?: { progress?: (loaded: number, total: number) => void; }) {
  const { req } = await createRequest('get', url);

  const progressFn = opts ? opts.progress : undefined;

  return new Promise<void>((resolve, reject) => {
    req
      .on('response', (res: any) => {
        if (res.statusCode !== 200) {
          reject(new Error(
            `Encountered bad status code (${res.statusCode}) for ${url}\n` +
            `This could mean the server is experiencing difficulties right now--please try again later.`
          ));
        }

        if (progressFn) {
          let loaded = 0;
          const total = Number(res.headers['content-length']);
          res.on('data', (chunk: any) => {
            loaded += chunk.length;
            progressFn(loaded, total);
          });
        }
      })
      .on('error', (err: any) => {
        if (err.code === 'ECONNABORTED') {
          reject(new Error(`Timeout of ${err.timeout}ms reached for ${url}`));
        } else {
          reject(err);
        }
      })
      .on('end', resolve);

    req.pipe(ws);
  });
}
