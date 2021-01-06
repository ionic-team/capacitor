import c from '../colors';
import { fatal } from '../errors';
import { logger, logSuccess, output } from '../log';
import { readConfig, writeConfig } from '../sysconfig';
import { THANK_YOU } from '../telemetry';

export async function telemetryCommand(onOrOff?: string): Promise<void> {
  const sysconfig = await readConfig();
  const enabled = interpretEnabled(onOrOff);

  if (typeof enabled === 'boolean') {
    if (sysconfig.telemetry === enabled) {
      logger.info(`Telemetry is already ${c.strong(enabled ? 'on' : 'off')}`);
    } else {
      await writeConfig({ ...sysconfig, telemetry: enabled });
      logSuccess(
        `You have ${c.strong(`opted ${enabled ? 'in' : 'out'}`)} ${
          enabled ? 'for' : 'of'
        } telemetry on this machine.`,
      );

      if (enabled) {
        output.write(THANK_YOU);
      }
    }
  } else {
    logger.info(`Telemetry is ${c.strong(sysconfig.telemetry ? 'on' : 'off')}`);
  }
}

function interpretEnabled(onOrOff?: string): boolean | undefined {
  switch (onOrOff) {
    case 'on':
      return true;
    case 'off':
      return false;
    case undefined:
      return undefined;
  }

  fatal(
    `Argument must be ${c.strong('on')} or ${c.strong(
      'off',
    )} (or left unspecified)`,
  );
}
