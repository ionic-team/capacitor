import { isFatal } from '../errors';
import { logger } from '../log';

export type CommanderAction = (...args: any[]) => void | Promise<void>;

export function wrapAction(action: CommanderAction): CommanderAction {
  return async (...args: any[]) => {
    try {
      await action(...args);
    } catch (e) {
      if (isFatal(e)) {
        process.exitCode = e.exitCode;
        logger.error(e.message);
      } else {
        throw e;
      }
    }
  };
}
