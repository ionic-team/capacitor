import { runCommand, runTask } from '../common';
import { Config } from '../config';

export async function serveWeb(config: Config) {
  await runTask(`Serving web content in: ${config.app.webDir}`, () => {
    return runCommand(`npx stencil-dev-server --root ${config.app.webDir}`);
  });
}
