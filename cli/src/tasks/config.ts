import util from 'util';

import type { Config } from '../definitions';
import { output } from '../log';

export async function configCommand(
  config: Config,
  json: boolean,
): Promise<void> {
  const evaluatedConfig = await deepAwait(config);

  if (json) {
    process.stdout.write(`${JSON.stringify(evaluatedConfig)}\n`);
  } else {
    output.write(
      `${util.inspect(evaluatedConfig, { depth: Infinity, colors: true })}\n`,
    );
  }
}

async function deepAwait(obj: any): Promise<any> {
  if (
    obj &&
    !Array.isArray(obj) &&
    typeof obj === 'object' &&
    obj.constructor === Object
  ) {
    const o: any = {};

    for (const [k, v] of Object.entries(obj)) {
      o[k] = await deepAwait(v);
    }

    return o;
  } else {
    return await obj;
  }
}
