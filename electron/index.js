const fs = require('fs');
const path = require('path');
const url = require('url');
const { app, ipcMain, BrowserWindow } = require('electron');
const imageDataURI = require('image-data-uri');

function getURLFileContents(path) {
  console.trace();
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err)
        reject(err);
      resolve(data.toString());
    });
  });
}

const configCapacitor = async function(mainWindow) {
  let capConfigJson = JSON.parse(fs.readFileSync(`./capacitor.config.json`, 'utf-8'));
  const appendUserAgent = capConfigJson.electron && capConfigJson.electron.appendUserAgent ? capConfigJson.electron.appendUserAgent : capConfigJson.appendUserAgent;
  if (appendUserAgent) {
    mainWindow.webContents.setUserAgent(mainWindow.webContents.getUserAgent() + " " + appendUserAgent);
  }
  const overrideUserAgent = capConfigJson.electron && capConfigJson.electron.overrideUserAgent ? capConfigJson.electron.overrideUserAgent : capConfigJson.overrideUserAgent;
  if (overrideUserAgent) {
    mainWindow.webContents.setUserAgent(overrideUserAgent);
  }
}

class CapacitorSplashScreen {

  /**
 * @param {BrowserWindow} mainWindow
 * @param {Object} splashOptions Options for customizing the splash screen.
 * @param {string} splashOptions.imageFileName Name of file placed in splash_assets folder
 * @param {number} splashOptions.windowWidth Width of the splash screen
 * @param {number} splashOptions.windowHeight Height of the splash screen
 * @param {string} splashOptions.textColor Loading text color
 * @param {string} splashOptions.loadingText Loading text
 * @param {number} splashOptions.textPercentageFromTop Relative distance of the loading text from top of the window
 * @param {boolean} splashOptions.transparentWindow If the window should of transparent
 * @param {boolean} splashOptions.autoHideLaunchSplash If auto hide the splash screen
 * @param {string} splashOptions.customHtml Custom html string, if used all most of customization options will be ignored
 */
  constructor(mainWindow, splashOptions) {
    this.mainWindowRef = null;
    this.splashWindow = null;

    if (!splashOptions) {
      splashOptions = {};
    }

    this.splashOptions = {
      imageFileName: splashOptions.imageFileName || 'splash.png',
      windowWidth: splashOptions.windowWidth || 400,
      windowHeight: splashOptions.windowHeight || 400,
      textColor: splashOptions.textColor || '#43A8FF',
      loadingText: splashOptions.loadingText || 'Loading...',
      textPercentageFromTop: splashOptions.textPercentageFromTop || 75,
      transparentWindow: splashOptions.transparentWindow || false,
      autoHideLaunchSplash: splashOptions.autoHideLaunchSplash || true,
      customHtml: splashOptions.customHtml || false
    };

    this.mainWindowRef = mainWindow;

    try {
      let capConfigJson = JSON.parse(fs.readFileSync(`./capacitor.config.json`, 'utf-8'));
      this.splashOptions = Object.assign(
        this.splashOptions,
        capConfigJson.plugins.SplashScreen || {}
      );
    } catch (e) {
      console.error(e.message);
    }

    ipcMain.on('showCapacitorSplashScreen', (event, options) => {
      this.show();
      if (options) {
        if (options.autoHide) {
          let showTime = options.showDuration || 3000;
          setTimeout(() => {
            this.hide();
          }, showTime);
        }
      }
    });

    ipcMain.on('hideCapacitorSplashScreen', (event, options) => {
      this.hide();
    });
  }

  async init() {
    let rootPath = app.getAppPath();

    this.splashWindow = new BrowserWindow({
      width: this.splashOptions.windowWidth,
      height: this.splashOptions.windowHeight,
      frame: false,
      show: false,
      transparent: this.splashOptions.transparentWindow,
      webPreferences: {
        webSecurity: true
      }
    });

    let imagePath = path.join(rootPath, 'splash_assets', this.splashOptions.imageFileName);
    let imageUrl = '';
    try {
      imageUrl = await imageDataURI.encodeFromFile(imagePath);
    } catch (err) {
      imageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAMgCAIAAAB0wSZfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAHqBJREFUeNrs3fuznVd52PFnbemYm5HMLdSuZZIU2bK51MZupglM8Q8w0zRJQ0Mm04Fp0wkGQ5nONFAu/0BnKLd02nIzTmbSDp1JQiBtIOnE/GDR0rTFYBsMvt8k11wTW7IdW+dI++1+9/u+a613n0NjfLYs7aPPZxJbPjrSOeMjvmf52etdKzVNEwCcfib+FQAINAACDSDQAAg0gEADINAACDSAQAMg0AACDYBAAyDQAAINgEADCDQAAg0g0AAINAACDSDQAAg0gEADINAACDSAQAMg0AACDYBAAwg0AAINgEADCDQAAg0g0AAINAACDSDQAAg0gEADINAAAg2AQAMg0AACDYBAAwg0AAINgEADCDQAAg0g0AAINAACDSDQAAg0gEADINAAAg2AQAMg0AACDYBAAwg0AAINgEADCDQAAg0g0AAINIBAAyDQAAg0gEADINAAAg2AQAMg0AACDYBAAwg0AAININAACDQAAg0g0AAINIBAAyDQAAg0gEADINAAAg2AQAMg0AACDYBAAwg0AAININAACDQAAg0g0AAINIBAAyDQAAg0gEADINAAAg2AQAMINAACDYBAAwg0AAININAACDQAAg0g0AAINIBAAyDQAAINgEADINAAAg2AQAMINAACDYBAAwg0AAININAACDQAAg0g0AAINIBAAyDQAAINgEADINAAAg2AQAMINAACDYBAAwg0AAININAACDSAQAMg0AAINIBAAyDQAAINgEADINAAAg2AQAMINAACDSDQAAg0AAININAACDSAQAMg0AAINIBAAyDQAAINgEADINAAAg2AQAMINAACDSDQAAg0AAININAACDSAQAMg0AAINIBAAyDQAAINgEADCDQAAg2AQAMINAACDSDQAAg0AAININAACDSAQAMg0AACDYBAAyDQAAINgEADCDQAAg2AQAMINAACDSDQAAg0AAININAACDSAQAMg0AACDYBAAyDQAAINgEADCDQAAg2AQAMINAACDSDQAAg0gEADINAACDSAQAMg0AACDYBAAyDQAAINgEADCDQAAg0g0AAINAACDSDQAAg0gEADINAACDSAQAMg0AACDYBAAwi0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AQQaAIEGEGgABBoAgQYQaAAEGkCgARBoAAQaQKABEGgAgQZAoAEEGgCBBkCgAQQaAIEGEGgABBoAgQYQaAAEGkCgARBoAIEGQKABEGgAgQZAoAEEGgCBBkCgAQQaAIEGEGgABBpAoAEQaAAEGkCgARBoAIEGQKABEGgAgQZAoAEEGgCBBkCgAQQaAIEGEGgABBpAoAEQaAAEGkCgARBoAIEGQKABEGgAgQZAoAEEGgCBBhBoAAQaAIEGEGgABBpAoAEQaAAEGkCgARBoAIEGQKABBBoAgQZAoAEEGgCBBhBoAAQaAIEGEGgABBpAoAEQaAAEGkCgARBoAIEGQKABBBoAgQZAoAEEGgCBBhBoAAQaAIEGEGgABBpAoAEQaACBBkCgARBoAIEGQKABBBoAgQZAoAEEGgCBBhBoAAQaQKABEGgABBpAoAEQaACBBkCgARBoAIEGQKABBBoAgQZAoAEEGgCBBhBoAAQaQKABEGgABBpAoAEQaACBBkCgARBoAIEGQKABBBoAgQYQaAAEGgCBBhBoAAQaQKABEGgABBpAoAEQaACBBkCgAQQaAIEGQKABBBoAgQYQaAAEGgCBBhBoAAQaQKABEGgABBpAoAEQaACBBkCgAQQaAIEGQKABBBoAgQYQaAAEGgCBBhBoAAQaQKABEGgAgQZAoAEQaACBBkCgAQQaAIEGQKABBBoAgQYQaAAEGkCgARBoAAQaQKABEGgAgQZAoAEQaACBBkCgAQQaAIEGEGj/CgAEGgCBBhBoAAQaQKABEGgABBpAoAEQaACBBkCgARBoAIEGQKABBBoAgQYQaAAEGgCBBhBoAAQaQKABEGgABBpAoAEQaACBBkCgAQQaAIEGQKABBBoAgQYQaAAEGgCBBhBoAAQaQKABEGgAgQZAoAEQaACBBkCgAQQaAIEGQKABBBoAgQYQaACeZv9PgAEAlH4PIVIvcesAAAAASUVORK5CYII=`;
    }

    let splashHtml = this.splashOptions.customHtml || `
      <html style="width: 100%; height: 100%; margin: 0; overflow: hidden;">
        <body style="background-image: url('${imageUrl}'); background-position: center center; background-repeat: no-repeat; width: 100%; height: 100%; margin: 0; overflow: hidden;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${this.splashOptions.textColor}; position: absolute; top: ${this.splashOptions.textPercentageFromTop}%; text-align: center; font-size: 10vw; width: 100vw;">
            ${this.splashOptions.loadingText}
          </div>
        </body>
      </html>
    `;

    this.mainWindowRef.on('closed', () => {
      if (this.splashWindow && !this.splashWindow.isDestroyed()) {
        this.splashWindow.close();
      }
    });
    
    this.splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`);

    this.splashWindow.webContents.on('dom-ready', async () => {
      this.splashWindow.show();
      setTimeout(async () => {
        this.mainWindowRef.loadURL(`file://${rootPath}/app/index.html`);
      }, 4500);
    });

    if (this.splashOptions.autoHideLaunchSplash) {
      this.mainWindowRef.webContents.on('dom-ready', () => {
        this.mainWindowRef.show();
        this.splashWindow.hide();
      });
    }
  }

  show() {
    this.splashWindow.show();
    this.mainWindowRef.hide();
  }

  hide() {
    this.mainWindowRef.show();
    this.splashWindow.hide();
  }

}

module.exports = {
  configCapacitor,
  CapacitorSplashScreen
};
