import { TERMINAL_INFO } from '@ionic/utils-terminal';

import c from '../colors';
import { logger } from '../log';

// Given input variables to a command, make sure all are provided if the terminal
// is not interactive (because we won't be able to prompt the user)
export const checkInteractive = (...args: string[]): boolean => {
  if (isInteractive()) {
    return true;
  }

  // Fail if no args are provided, treat this as just a check of whether the term is
  // interactive or not.
  if (!args.length) {
    return false;
  }

  // Make sure none of the provided args are empty, otherwise print the interactive
  // warning and return false
  if (args.filter(arg => !arg).length) {
    logger.error(
      `Non-interactive shell detected.\n` +
        `Run the command with ${c.input(
          '--help',
        )} to see a list of arguments that must be provided.`,
    );
    return false;
  }
  return true;
};

export const isInteractive = (): boolean =>
  TERMINAL_INFO.tty && !TERMINAL_INFO.ci;
