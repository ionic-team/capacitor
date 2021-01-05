import type {
  CallData,
  CapacitorInstance,
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

const ADVANCED_CONSOLE_METHODS: (keyof Console)[] = [
  'groupCollapsed',
  'groupEnd',
  'dir',
];

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

const useAdvancedLogging = (win: WindowCapacitor): boolean => {
  return !ADVANCED_CONSOLE_METHODS.some(fn => !(fn in win.console));
};

export const initLogger = (
  win: WindowCapacitor,
  cap: CapacitorInstance,
  postToNative: (data: any) => void | null,
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

  cap.handleWindowError = (msg, url, lineNo, columnNo, err) => {
    const str = msg.toLowerCase();

    if (str.indexOf('script error') > -1) {
      // Some IE issue?
    } else {
      const errObj = {
        type: 'js.error',
        error: {
          message: msg,
          url: url,
          line: lineNo,
          col: columnNo,
          errorObject: JSON.stringify(err),
        },
      };

      if (err !== null) {
        cap.handleError(err);
      }

      if (postToNative) {
        postToNative(errObj);
      }
    }

    return false;
  };

  if (cap.DEBUG) {
    window.onerror = cap.handleWindowError;
  }

  cap.logToNative = (call: CallData) => {
    if (useAdvancedLogging(win)) {
      originalConsole.groupCollapsed(
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
      originalConsole.dir(call);
      originalConsole.groupEnd();
    } else {
      win.console.log('LOG TO NATIVE: ', call);
      if (cap.getPlatform() === 'ios') {
        try {
          cap.toNative('Console', 'log', {
            message: JSON.stringify(call),
          });
        } catch (e) {
          win.console.log('Error converting/posting console messages');
        }
      }
    }
  };

  cap.logFromNative = result => {
    if (useAdvancedLogging(win)) {
      const success = result.success === true;

      const tagStyles = success
        ? 'font-style: italic; font-weight: lighter; color: gray'
        : 'font-style: italic; font-weight: lighter; color: red';

      originalConsole.groupCollapsed(
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
        originalConsole.error(result.error);
      } else {
        originalConsole.dir(result.data);
      }
      originalConsole.groupEnd();
    } else {
      if (result.success === false) {
        win.console.error(result.error);
      } else {
        win.console.log(result.data);
      }
    }
  };
};
