import { Config } from '../config';
import { logFatal, logInfo, runTask } from '../common';
import { serveWeb } from '../web/serve';

export async function serveCommand(config: Config) {
  try {
    await serve(config);
  } catch (e) {
    logFatal(e);
  }
}

export async function serve(config: Config) {
  return serveWeb(config);
}
