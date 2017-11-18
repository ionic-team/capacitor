window.IonicDevServerConfig = window.IonicDevServerConfig || {};

window.IonicDevServer = {
  start: function() {
    this.msgQueue = [];

    this.consoleLog = console.log;
    this.consoleError = console.error;
    this.consoleWarn = console.warn;

    IonicDevServerConfig.systemInfo.push('Navigator Platform: ' + window.navigator.platform);
    IonicDevServerConfig.systemInfo.push('User Agent: ' + window.navigator.userAgent);

    if (IonicDevServerConfig.sendConsoleLogs) {
      this.patchConsole();
    }

    this.openConnection();
    this.bindEvents();

    var self = this;
    document.addEventListener("DOMContentLoaded", function() {
      var diagnosticsEle = document.getElementById('ion-diagnostics');
      if (diagnosticsEle) {
        self.buildStatus('error');
      } else {
        self.buildStatus('success');
      }
    });

    if (window.cordova && document.documentElement) {
      document.documentElement.classList.add('ion-diagnostics-cordova');

      var ua = window.navigator.userAgent.toLowerCase();
      if ((ua.indexOf('ipad') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipod') > -1) && ua.indexOf('windows phone') === -1) {
        document.documentElement.classList.add('ion-diagnostics-cordova-ios');
      }
    }

    window.onerror = function(msg, url, lineNo, columnNo, error) {
      self.handleError(error);
    };
  },

  handleError: function(err) {
    if (!err) return;

    // Ignore HTTP errors
    if(err.url || err.headers) return;

    // Socket is ready so send this error to the server for prettifying
    if (this.socketReady) {
      var msg = {
        category: 'runtimeError',
        type: 'runtimeError',
        data: {
          message: err.message ? err.message.toString() : null,
          stack: err.stack ? err.stack.toString() : null
        }
      };
      this.queueMessageSend(msg);

    } else {
      var c = [];

      c.push('<div class="ion-diagnostics-header">');
      c.push(' <div class="ion-diagnostics-header-content">');
      c.push('  <div class="ion-diagnostics-header-inner">Error</div>');
      c.push('  <div class="ion-diagnostics-buttons">');
      c.push('   <button id="ion-diagnostic-close">Close</button>');
      c.push('  </div>');
      c.push(' </div>');
      c.push('</div>');

      c.push('<div class="ion-diagnostics-content">');
      c.push(' <div class="ion-diagnostic">');
      c.push('  <div class="ion-diagnostic-masthead">');
      c.push('   <div class="ion-diagnostic-header">Runtime Error</div>');
      c.push('   <div class="ion-diagnostic-message">' + this.escapeHtml(err.message) + '</div>');
      c.push('  </div>');
      c.push('  <div class="ion-diagnostic-stack-header">Stack</div>');
      c.push('  <div class="ion-diagnostic-stack">' + this.escapeHtml(err.stack) + '</div>');
      c.push(' </div>');
      c.push('</div>');

      this.buildUpdate({
        type: 'clientError',
        data: {
          diagnosticsHtml: c.join('')
        }
      });
    }
  },

  reloadApp: function() {
    window.location.reload(true);
  },

  openConnection: function() {
    var self = this;
    this.socket = new WebSocket('ws://' + window.location.hostname + ':' + IonicDevServerConfig.wsPort);

    this.socket.onopen = function(ev) {
      self.socketReady = true;

      self.socket.onmessage = function(ev) {
        try {
          var msg = JSON.parse(ev.data);
          switch (msg.category) {
            case 'buildUpdate':
              self.buildUpdate(msg);
              break;
          }
        } catch (e) {
          self.consoleError('error receiving ws message', e);
        }
      };

      self.socket.onclose = function() {
        self.consoleLog('Dev server logger closed');
        self.socketReady = false;
      };

      self.drainMessageQueue();
    };
  },

  queueMessageSend: function(msg) {
    this.msgQueue.push(msg);
    this.drainMessageQueue();
  },

  drainMessageQueue: function() {
    if (this.socketReady) {
      var msg;
      while (msg = this.msgQueue.shift()) {
        try {
          this.socket.send(JSON.stringify(msg));
        } catch(e) {
          if (e instanceof TypeError) {

          } else {
            this.consoleError('ws error: ' + e);
          }
        }
      }
    }
  },

  patchConsole: function() {
    var self = this;
    function patchConsole(consoleType) {
      console[consoleType] = (function() {
        var orgConsole = console[consoleType];
        return function() {
          orgConsole.apply(console, arguments);
          var msg = {
            category: 'console',
            type: consoleType,
            data: []
          };
          for (var i = 0; i < arguments.length; i++) {
            msg.data.push(arguments[i]);
          }
          if (msg.data.length) {
            self.queueMessageSend(msg);
          }
        };
      })();
    }

    for (var consoleType in console) {
      if (console.hasOwnProperty(consoleType) && typeof console[consoleType] === 'function') {
        patchConsole(consoleType);
      }
    }
  },

  /**
   * Process a build update message and display something to the friendly user.
   */
  buildUpdate: function(msg) {
    var status = 'success';

    if (msg.type === 'started') {
      status = 'active';
      this.buildingNotification(true);

    } else {

      if (msg.data.reloadApp) {
        this.reloadApp();
        return;
      }

      status = msg.data.diagnosticsHtml ? 'error' : 'success';

      this.buildingNotification(false);

      var diagnosticsEle = document.getElementById('ion-diagnostics');

      // If we have an element but no html created yet
      if (diagnosticsEle && !msg.data.diagnosticsHtml) {
        diagnosticsEle.classList.add('ion-diagnostics-fade-out');

        this.diagnosticsTimerId = setTimeout(function() {
          var diagnosticsEle = document.getElementById('ion-diagnostics');
          if (diagnosticsEle) {
            diagnosticsEle.parentElement.removeChild(diagnosticsEle);
          }
        }, 100);

      } else if (msg.data.diagnosticsHtml) {

        // We don't have an element but we have diagnostics HTML, so create the error

        if (!diagnosticsEle) {
          diagnosticsEle = document.createElement('div');
          diagnosticsEle.id = 'ion-diagnostics';
          diagnosticsEle.className = 'ion-diagnostics-fade-out';
          document.body.insertBefore(diagnosticsEle, document.body.firstChild);
        }

        // Show the last error
        clearTimeout(this.diagnosticsTimerId);
        this.diagnosticsTimerId = setTimeout(function() {
          var diagnosticsEle = document.getElementById('ion-diagnostics');
          if (diagnosticsEle) {
            diagnosticsEle.classList.remove('ion-diagnostics-fade-out');
          }
        }, 24);

        diagnosticsEle.innerHTML = msg.data.diagnosticsHtml
      }
    }

    this.buildStatus(status);
  },

  buildStatus: function (status) {
    var iconLinks = document.querySelectorAll('link[rel="icon"]');
    for (var i = 0; i < iconLinks.length; i++) {
      iconLinks[i].parentElement.removeChild(iconLinks[i]);
    }

    var iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = 'image/png';
    iconLink.href = this[status + 'Icon'];
    document.head.appendChild(iconLink);

    if (status === 'error') {
      var diagnosticsEle = document.getElementById('ion-diagnostics');
      if (diagnosticsEle) {
        var systemInfoEle = diagnosticsEle.querySelector('#ion-diagnostics-system-info');
        if (!systemInfoEle) {
          systemInfoEle = document.createElement('div');
          systemInfoEle.id = 'ion-diagnostics-system-info';
          systemInfoEle.innerHTML = IonicDevServerConfig.systemInfo.join('\n');
          diagnosticsEle.querySelector('.ion-diagnostics-content').appendChild(systemInfoEle);
        }
      }
    }
  },

  buildingNotification: function(showToast) {
    clearTimeout(this.toastTimerId);

    var toastEle = document.getElementById('ion-diagnostics-toast');

    if (showToast) {
      if (!toastEle) {
        toastEle = document.createElement('div');
        toastEle.id = 'ion-diagnostics-toast';
        var c = []
        c.push('<div class="ion-diagnostics-toast-content">');
        c.push(' <div class="ion-diagnostics-toast-message">Building...</div>');
        c.push(' <div class="ion-diagnostics-toast-spinner">');
        c.push('  <svg viewBox="0 0 64 64"><circle transform="translate(32,32)" r="26"></circle></svg>');
        c.push(' </div>');
        c.push('</div>');
        toastEle.innerHTML = c.join('');
        document.body.insertBefore(toastEle, document.body.firstChild);
      }

      this.toastTimerId = setTimeout(function() {
        var toastEle = document.getElementById('ion-diagnostics-toast');
        if (toastEle) {
          toastEle.classList.add('ion-diagnostics-toast-active');
        }
      }, 16);

    } else if (!showToast && toastEle) {
      toastEle.classList.remove('ion-diagnostics-toast-active');
    }
  },

  toggleOptionsMenu: function() {
    var optsEle = document.getElementById('ion-diagnostics-options');
    this.optionsMenu(!optsEle);
  },

  optionsMenu: function(showMenu) {
    clearTimeout(this.optionsMenuTimerId);

    var optsEle = document.getElementById('ion-diagnostics-options');
    if (showMenu) {

      if (!optsEle) {
        var c = [];

        c.push('<div id="ion-diagnostics-backdrop"></div>');
        c.push('<div class="ion-diagnostics-sheet-wrapper">');
        c.push(  '<div class="ion-diagnostics-sheet-container">');
        c.push(    '<div class="ion-diagnostics-sheet-group">');
        c.push(      '<div class="ion-diagnostics-sheet-title">Ionic App Debugger</div>');
        c.push(      '<button id="ion-diagnostics-options-reload-app" class="ion-diagnostics-sheet-button">Reload App</button>');
        c.push(    '</div>');
        c.push(    '<div class="ion-diagnostics-sheet-group">');
        c.push(      '<button id="ion-diagnostics-options-close" class="ion-diagnostics-sheet-button">Close Menu</button>');
        c.push(    '</div>');
        c.push(  '</div>');
        c.push('</div>');

        optsEle = document.createElement('div');
        optsEle.id = 'ion-diagnostics-options';
        optsEle.innerHTML = c.join('\n');
        document.body.insertBefore(optsEle, document.body.firstChild);
      }
      this.optionsMenuTimerId = setTimeout(function() {
        var optsEle = document.getElementById('ion-diagnostics-options');
        optsEle.classList.add('ion-diagnostics-options-show');
      }, 16);

    } else if (!showMenu && optsEle) {
      optsEle.classList.remove('ion-diagnostics-options-show');

      this.optionsMenuTimerId = setTimeout(function() {
        optsEle.parentElement.removeChild(optsEle);
      }, 300);

    }
  },

  bindEvents: function() {
    var self = this;

    document.addEventListener('keyup', function(ev) {
      var key = ev.keyCode || ev.charCode;

      if (key == 27) {
        // escape key
        self.optionsMenu(false);
      }
    });

    document.addEventListener('keydown', function(ev) {
      var key = ev.keyCode || ev.charCode;

      if ((ev.metaKey || ev.ctrlKey) && ev.shiftKey && key == 56) {
        // mac: command + shift + 8
        // win: ctrl + shift + 8
        self.toggleOptionsMenu();
      }
    });

    document.addEventListener('click', function(ev) {
      if (!ev.target) return;

      switch (ev.target.id) {
        case 'ion-diagnostic-close':
          self.buildUpdate({
            type: 'closeDiagnostics',
            data: {
              diagnosticsHtml: null
            }
          });
          break;

        case 'ion-diagnostics-options-reload-app':
          self.reloadApp();
          break;

        case 'ion-diagnostics-backdrop':
          self.optionsMenu(false);
          break;

        case 'ion-diagnostics-options-close':
          self.optionsMenu(false);
          break;
      }
    });

    this.enableShake();
  },

  enableShake: function() {
    /*
    * Author: Alex Gibson
    * https://github.com/alexgibson/shake.js
    * License: MIT license
    */
    var self = this;
    var threshold = 15;
    var timeout = 1000;

    self.shakeTime = new Date();
    self.shakeX = null;
    self.shakeY = null;
    self.shakeZ = null;

    window.addEventListener('devicemotion', function(ev) {
      var current = ev.accelerationIncludingGravity;
      var currentTime;
      var timeDifference;
      var deltaX = 0;
      var deltaY = 0;
      var deltaZ = 0;

      if (self.shakeX === null) {
        self.shakeX = current.x;
        self.shakeY = current.y;
        self.shakeZ = current.z;
        return;
      }

      deltaX = Math.abs(self.shakeX - current.x);
      deltaY = Math.abs(self.shakeY - current.y);
      deltaZ = Math.abs(self.shakeZ - current.z);

      if (((deltaX > threshold) && (deltaY > threshold)) || ((deltaX > threshold) && (deltaZ > threshold)) || ((deltaY > threshold) && (deltaZ > threshold))) {
        currentTime = new Date();
        timeDifference = currentTime.getTime() - self.shakeTime.getTime();

        if (timeDifference > timeout) {
          self.optionsMenu(true);
          self.shakeTime = new Date();
        }
      }

      self.shakeX = current.x;
      self.shakeY = current.y;
      self.shakeZ = current.z;
    });

  },

  escapeHtml: function (unsafe) {
    return unsafe
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
  },

  activeIcon: 'data:image/png;base64,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',

  errorIcon: 'data:image/png;base64,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',

  successIcon: 'data:image/png;base64,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'

};

IonicDevServer.start();
