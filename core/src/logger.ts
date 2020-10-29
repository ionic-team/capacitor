import type {
  CallData,
  CapacitorInstance,
  GlobalInstance,
  InternalState,
} from './definitions';

export const initLogger = (
  gbl: GlobalInstance,
  instance: CapacitorInstance,
  state: InternalState,
  postToNative: (data: any) => void | null,
): void => {
  // patch window.console on iOS and store original console fns
  const isIos = state.platform === 'ios';
  const orgConsole = (isIos ? {} : gbl.console) as any;

  const useFallbackLogging =
    !!gbl.console && Object.keys(gbl.console).length === 0;
  if (useFallbackLogging && gbl.console) {
    gbl.console.warn('Advance console logging disabled.');
  }

  // list log functions bridged to native log
  const bridgedLevels: { [key: string]: boolean } = {
    debug: true,
    error: true,
    info: true,
    log: true,
    trace: true,
    warn: true,
  };

  if (isIos && gbl.console) {
    Object.keys(gbl.console).forEach(level => {
      if (typeof gbl.console[level] === 'function') {
        // loop through all the console functions and keep references to the original
        orgConsole[level] = gbl.console[level];
        gbl.console[level] = function capacitorConsole() {
          let msgs: any[] = Array.prototype.slice.call(arguments);

          // console log to browser
          orgConsole[level].apply(gbl.console, msgs);

          if (bridgedLevels[level]) {
            // send log to native to print
            try {
              // convert all args to strings
              msgs = msgs.map(arg => {
                if (typeof arg === 'object') {
                  try {
                    arg = JSON.stringify(arg);
                  } catch (e) {}
                }
                // convert to string
                return String(arg);
              });
              instance.toNative('Console', 'log', {
                level: level,
                message: msgs.join(' '),
              });
            } catch (e) {
              // error converting/posting console messages
              orgConsole.error.apply(gbl.console, e);
            }
          }
        };
      }
    });
  }

  instance.logJs = (message, level) => {
    switch (level) {
      case 'error':
        gbl.console.error(message);
        break;
      case 'warn':
        gbl.console.warn(message);
        break;
      case 'info':
        gbl.console.info(message);
        break;
      default:
        gbl.console.log(message);
    }
  };

  instance.handleError = (e: Error) => gbl.console.error(e);

  instance.handleWindowError = (msg, url, lineNo, columnNo, error) => {
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
          errorObject: JSON.stringify(error),
        },
      };

      if (error !== null) {
        instance.handleError(error);
      }

      if (postToNative) {
        postToNative(errObj);
      }
    }

    return false;
  };

  if (instance.DEBUG) {
    window.onerror = instance.handleWindowError;
  }

  instance.logToNative = (call: CallData) => {
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
      gbl.console.log('LOG TO NATIVE: ', call);
      if (state.platform === 'ios') {
        try {
          instance.toNative('Console', 'log', {
            message: JSON.stringify(call),
          });
        } catch (e) {
          gbl.console.log('Error converting/posting console messages');
        }
      }
    }
  };

  instance.logFromNative = result => {
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
        gbl.console.error(result.error);
      } else {
        gbl.console.log(result.data);
      }
    }
  };

  return (level: string, msg: any) => {
    if (orgConsole) {
      if (typeof orgConsole[level] === 'function') {
        orgConsole[level].call(gbl.console, msg);
      } else if (orgConsole.log) {
        orgConsole.log.call(gbl.console, msg);
      }
    }
  };
};
