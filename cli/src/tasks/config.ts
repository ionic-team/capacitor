import util from 'util';

import type { Config } from '../definitions';
import { output } from '../log';

export async function configCommand(
  config: Config,
  json: boolean,
): Promise<void> {
  if (json) {
    output.write(JSON.stringify(config));
  } else {
    output.write(
      `${util.inspect(config, { depth: Infinity, colors: true })}\n`,
    );
  }
}
