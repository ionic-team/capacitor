import { CheckFunction, runCommand, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';

export async function serveWeb(config: Config) {
  await runTask(`Serving web content in: ${config.app.webDir}`, () => {
    return runCommand(`npx stencil-dev-server --root ${config.app.webDir}`);
  });
}
