import {
  LOGGER_LEVELS,
  LoggerLevelWeight,
  StreamOutputStrategy,
  TTYOutputStrategy,
  createDefaultLogger,
} from '@ionic/cli-framework-output';
import kleur from 'kleur';

import { COLORS } from './colors';
import { isInteractive } from './term';

const options = { colors: COLORS, stream: process.stdout };

export const output = isInteractive()
  ? new TTYOutputStrategy(options)
  : new StreamOutputStrategy(options);

export const logger = createDefaultLogger({
  output,
  formatterOptions: {
    titleize: false,
    tags: new Map<LoggerLevelWeight, string>([
      [LOGGER_LEVELS.DEBUG, kleur.magenta('[debug]')],
      [LOGGER_LEVELS.INFO, kleur.cyan('[info]')],
      [LOGGER_LEVELS.WARN, kleur.yellow('[warn]')],
      [LOGGER_LEVELS.ERROR, kleur.red('[error]')],
    ]),
  },
});
