import { fork } from '@ionic/utils-subprocess';
import Debug from 'debug';
import { open, mkdirp } from 'fs-extra';
import { request } from 'https';
import { resolve } from 'path';

import type { Metric } from './telemetry';
import { ENV_PATHS } from './util/cli';

const debug = Debug('capacitor:ipc');

/**
 * How long an awaited delivery may take. Short enough that a developer never
 * notices it, long enough for a request from a cold sandbox.
 */
const DELIVERY_TIMEOUT = 3000;

export interface TelemetryIPCMessage {
  type: 'telemetry';
  data: Metric<string, unknown>;
}

export type IPCMessage = TelemetryIPCMessage;

/**
 * Send an IPC message to a forked process.
 */
export async function send(msg: IPCMessage): Promise<void> {
  const dir = ENV_PATHS.log;
  await mkdirp(dir);
  const logPath = resolve(dir, 'ipc.log');

  debug('Sending %O IPC message to forked process (logs: %O)', msg.type, logPath);

  const fd = await open(logPath, 'a');
  const p = fork(process.argv[1], ['📡'], { stdio: ['ignore', fd, fd, 'ipc'] });

  p.send(msg);
  p.disconnect();
  p.unref();
}

/**
 * Receive and handle an IPC message.
 *
 * Assume minimal context and keep external dependencies to a minimum.
 */
export async function receive(msg: IPCMessage): Promise<void> {
  debug('Received %O IPC message', msg.type);

  if (msg.type === 'telemetry') {
    await deliver(msg.data);
  }
}

/**
 * POST a metric to the events service.
 *
 * Never rejects and never writes to stderr. Telemetry failing is not something
 * the caller can act on, and it must not change the command's outcome or its
 * exit code — so every ending, including the timeout, resolves.
 */
export function deliver(data: Metric<string, unknown>, timeout: number = DELIVERY_TIMEOUT): Promise<void> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ metrics: [data], sent_at: new Date().toISOString() });
    let settled = false;

    const finish = (reason: string): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(deadline);
      debug('Delivery of %O metric %s', data.name, reason);
      resolve();
    };

    // An overall deadline rather than `req.setTimeout`, which is a socket
    // inactivity timer and only arms once the socket connects — so it never
    // fires against an unroutable host, which is exactly the sandbox this
    // bound exists for. Unref'd so a pending request can't hold the CLI open.
    const deadline = setTimeout(() => {
      req.destroy();
      finish('timed out');
    }, timeout);

    deadline.unref();

    // This request is only made if telemetry is on.
    const req = request(
      {
        hostname: 'metrics-capacitor.outsystems.com',
        port: 443,
        path: '/metrics',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (response) => {
        debug('Sent %O metric to events service (status: %O)', data.name, response.statusCode);

        if (response.statusCode === 202) {
          // Draining is what lets the socket close; without it an awaited
          // delivery sits until the timeout fires.
          response.resume();
        } else {
          response.on('data', (chunk) => {
            debug('Bad response from events service. Request body: %O', chunk.toString());
          });
        }

        response.on('end', () => finish('completed'));
        response.on('error', () => finish('failed reading the response'));
      },
    );

    req.on('error', (e) => finish(`failed: ${e.message}`));

    req.end(body);
  });
}
