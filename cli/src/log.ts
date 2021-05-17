import {
  LOGGER_LEVELS,
  StreamOutputStrategy,
  TTYOutputStrategy,
  createDefaultLogger,
} from '@ionic/cli-framework-output';

import c from './colors';
import { isInteractive } from './util/term';

import type { LoggerLevelWeight } from '@ionic/cli-framework-output';
import type { Answers, PromptObject } from 'prompts';

const options = {
  colors: c,
  stream: process.argv.includes('--json') ? process.stderr : process.stdout,
};

export const output = isInteractive()
  ? new TTYOutputStrategy(options)
  : new StreamOutputStrategy(options);

export const logger = createDefaultLogger({
  output,
  formatterOptions: {
    titleize: false,
    tags: new Map<LoggerLevelWeight, string>([
      [LOGGER_LEVELS.DEBUG, c.log.DEBUG('[debug]')],
      [LOGGER_LEVELS.INFO, c.log.INFO('[info]')],
      [LOGGER_LEVELS.WARN, c.log.WARN('[warn]')],
      [LOGGER_LEVELS.ERROR, c.log.ERROR('[error]')],
    ]),
  },
});

export async function logPrompt<T extends string>(
  msg: string,
  promptObject: PromptObject<T>,
): Promise<Answers<T>> {
  const { wordWrap } = await import('@ionic/cli-framework-output');
  const { prompt } = await import('prompts');

  logger.log({
    msg: `${c.input('[?]')} ${wordWrap(msg, { indentation: 4 })}`,
    logger,
    format: false,
  });

  return prompt(promptObject, { onCancel: () => process.exit(1) });
}

export function logSuccess(msg: string): void {
  logger.msg(`${c.success('[success]')} ${msg}`);
}
