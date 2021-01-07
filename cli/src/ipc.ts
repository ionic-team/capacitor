import { open, mkdirp } from '@ionic/utils-fs';
import { fork } from '@ionic/utils-subprocess';
import Debug from 'debug';
import { request } from 'https';
import { resolve } from 'path';

import type { Metric } from './telemetry';
import { ENV_PATHS } from './util/cli';

const debug = Debug('capacitor:ipc');

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

  debug(
    'Sending %O IPC message to forked process (logs: %O)',
    msg.type,
    logPath,
  );

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
    const now = new Date().toISOString();
    const { data } = msg;

    // This request is only made if telemetry is on.
    const req = request(
      {
        hostname: 'api.ionicjs.com',
        port: 443,
        path: '/events/metrics',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      response => {
        debug(
          'Sent %O metric to events service (status: %O)',
          data.name,
          response.statusCode,
        );

        if (response.statusCode !== 204) {
          response.on('data', chunk => {
            debug(
              'Bad response from events service. Request body: %O',
              chunk.toString(),
            );
          });
        }
      },
    );

    const body = {
      metrics: [data],
      sent_at: now,
    };

    req.end(JSON.stringify(body));
  }
}
