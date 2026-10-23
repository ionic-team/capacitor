import c from '../colors';
import { fatal } from '../errors';
import { logger, logSuccess, output } from '../log';
import { readConfig, writeConfig } from '../sysconfig';
import { isTelemetryDisabledByEnv } from '../telemetry';

const THANK_YOU =
  `\nThank you for helping to make Capacitor better! 💖` +
  `\nInformation about the data we collect is available on our website: ${c.strong('https://capacitorjs.com/docs/next/cli/telemetry')}\n`;

export async function telemetryCommand(onOrOff?: string): Promise<void> {
  const sysconfig = await readConfig();
  const enabled = interpretEnabled(onOrOff);

  if (typeof enabled === 'boolean') {
    if (sysconfig.telemetry === enabled) {
      logger.info(`Telemetry is already ${c.strong(enabled ? 'on' : 'off')}`);
    } else {
      await writeConfig({ ...sysconfig, telemetry: enabled });
      logSuccess(
        `You have ${c.strong(`opted ${enabled ? 'in' : 'out'}`)} ${enabled ? 'for' : 'of'} telemetry on this machine.`,
      );

      if (enabled) {
        output.write(THANK_YOU);
      }
    }
  } else {
    logger.info(`Telemetry is ${c.strong(sysconfig.telemetry === false ? 'off' : 'on')}`);
  }

  // The stored setting is reported above because that is what this command
  // writes, but the environment wins at send time. Saying so avoids the
  // command contradicting what the CLI actually does.
  if (isTelemetryDisabledByEnv(process.env)) {
    logger.info(`Telemetry is disabled for this environment by ${c.input('CAP_TELEMETRY_DISABLED')}`);
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

  fatal(`Argument must be ${c.strong('on')} or ${c.strong('off')} (or left unspecified)`);
}
