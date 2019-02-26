import { runCommand, runTask } from '../common';
import { Config } from '../config';

export async function serveWeb(config: Config) {
  await runTask(`Serving web content in: ${config.app.webDir}`, () => {
    return runCommand(`npx stencil build --dev --watch\` \`${config.app.webDir}`);
  });
}
