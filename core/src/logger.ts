import type {
  CallData,
  CapacitorInstance,
  WindowCapacitor,
  Logger,
} from './definitions-internal';

export const initLogger = (
  win: WindowCapacitor,
  cap: CapacitorInstance,
  postToNative: (data: any) => void | null,
): Logger => {
  // patch window.console on iOS and store original console fns
  const isIos = cap.getPlatform() === 'ios';
  const orgConsole = (isIos ? {} : win.console) as any;

  // list log functions bridged to native log
  const bridgedLevels: { [key: string]: boolean } = {
    debug: true,
    error: true,
    info: true,
    log: true,
    trace: true,
    warn: true,
  };

  const useFallbackLogging =
    !!win.console && Object.keys(win.console).length === 0;

  if (useFallbackLogging && win.console) {
    win.console.warn('Advance console logging disabled.');
  }

  if (isIos && win.console) {
    Object.keys(win.console).forEach(level => {
      if (typeof win.console[level] === 'function') {
        // loop through all the console functions and keep references to the original
        orgConsole[level] = win.console[level];
        win.console[level] = (...args: any[]) => {
          let msgs: any[] = Array.prototype.slice.call(args);

          // console log to browser
          orgConsole[level].apply(win.console, msgs);

          if (bridgedLevels[level]) {
            // send log to native to print
            try {
              // convert all args to strings
              msgs = msgs.map(arg => {
                if (typeof arg === 'object') {
                  try {
                    arg = JSON.stringify(arg);
                  } catch (e) {
                    /**/
                  }
                }
                // convert to string
                return String(arg);
              });
              cap.toNative('Console', 'log', {
                level: level,
                message: msgs.join(' '),
              });
            } catch (e) {
              // error converting/posting console messages
              orgConsole.error.apply(win.console, e);
            }
          }
        };
      }
    });
  }

  cap.handleWindowError = (msg, url, lineNo, columnNo, err) => {
    const str = msg.toLowerCase();
    const substring = 'script error';

    if (str.indexOf(substring) > -1) {
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
    if (!useFallbackLogging) {
      orgConsole.groupCollapsed(
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
      orgConsole.dir(call);
      orgConsole.groupEnd();
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
    if (!useFallbackLogging) {
      const success = result.success === true;

      const tagStyles = success
        ? 'font-style: italic; font-weight: lighter; color: gray'
        : 'font-style: italic; font-weight: lighter; color: red';

      orgConsole.groupCollapsed(
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
        orgConsole.error(result.error);
      } else {
        orgConsole.dir(result.data);
      }
      orgConsole.groupEnd();
    } else {
      if (result.success === false) {
        win.console.error(result.error);
      } else {
        win.console.log(result.data);
      }
    }
  };

  return (level: string, msg: any) => {
    if (orgConsole) {
      if (typeof orgConsole[level] === 'function') {
        orgConsole[level].call(win.console, msg);
      } else if (orgConsole.log) {
        orgConsole.log.call(win.console, msg);
      }
    }
  };
};
