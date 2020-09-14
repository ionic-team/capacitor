import {
  LOGGER_LEVELS,
  LoggerLevelWeight,
  StreamOutputStrategy,
  TTYOutputStrategy,
  createDefaultLogger,
} from '@ionic/cli-framework-output';

import colors from './colors';
import { isInteractive } from './util/term';

const options = { colors, stream: process.stdout };

export const output = isInteractive()
  ? new TTYOutputStrategy(options)
  : new StreamOutputStrategy(options);

export const logger = createDefaultLogger({
  output,
  formatterOptions: {
    titleize: false,
    tags: new Map<LoggerLevelWeight, string>([
      [LOGGER_LEVELS.DEBUG, colors.log.DEBUG('[debug]')],
      [LOGGER_LEVELS.INFO, colors.log.INFO('[info]')],
      [LOGGER_LEVELS.WARN, colors.log.WARN('[warn]')],
      [LOGGER_LEVELS.ERROR, colors.log.ERROR('[error]')],
    ]),
  },
});
