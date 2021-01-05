import type {
  CallData,
  CapacitorInstance,
  PluginResult,
  WindowCapacitor,
} from './definitions-internal';

const BRIDGED_CONSOLE_METHODS: (keyof Console)[] = [
  'debug',
  'error',
  'info',
  'log',
  'trace',
  'warn',
];

export const initLogger = (
  win: WindowCapacitor,
  cap: CapacitorInstance,
): void => {
  // patch window.console on iOS and store original console fns
  const isIos = cap.getPlatform() === 'ios';
  const originalConsole: Console = { ...win.console };

  if (win.console && isIos) {
    for (const logfn of BRIDGED_CONSOLE_METHODS) {
      win.console[logfn] = (...args: any[]) => {
        const msgs = [...args];

        originalConsole[logfn](...msgs);

        try {
          cap.toNative('Console', 'log', {
            level: logfn,
            message: msgs.map(serializeConsoleMessage).join(' '),
          });
        } catch (e) {
          // error converting/posting console messages
          originalConsole.error(e);
        }
      };
    }
  }

  cap.logToNative = createLogToNative(win.console);
  cap.logFromNative = createLogFromNative(win.console);
};

const serializeConsoleMessage = (msg: any): string => {
  if (typeof msg === 'object') {
    try {
      msg = JSON.stringify(msg);
    } catch (e) {
      // ignore
    }
  }

  return String(msg);
};

const isFullConsole = (c: Partial<Console>): c is Console => {
  if (!c) {
    return false;
  }

  return (
    typeof c.groupCollapsed === 'function' ||
    typeof c.groupEnd === 'function' ||
    typeof c.dir === 'function'
  );
};

const createLogToNative = (c: Partial<Console>) => (call: CallData) => {
  if (isFullConsole(c)) {
    c.groupCollapsed(
      '%cnative %c' +
        call.pluginId +
        '.' +
        call.methodName +
        ' (#' +
        call.callbackId +
        ')',
      'font-weight: lighter; color: gray',
      'font-weight: bold; color: #000',
    );
    c.dir(call);
    c.groupEnd();
  } else {
    c.log('LOG TO NATIVE: ', call);
  }
};

const createLogFromNative = (c: Partial<Console>) => (result: PluginResult) => {
  if (isFullConsole(c)) {
    const success = result.success === true;

    const tagStyles = success
      ? 'font-style: italic; font-weight: lighter; color: gray'
      : 'font-style: italic; font-weight: lighter; color: red';

    c.groupCollapsed(
      '%cresult %c' +
        result.pluginId +
        '.' +
        result.methodName +
        ' (#' +
        result.callbackId +
        ')',
      tagStyles,
      'font-style: italic; font-weight: bold; color: #444',
    );
    if (result.success === false) {
      c.error(result.error);
    } else {
      c.dir(result.data);
    }
    c.groupEnd();
  } else {
    if (result.success === false) {
      c.error('LOG FROM NATIVE', result.error);
    } else {
      c.log('LOG FROM NATIVE', result.data);
    }
  }
};
