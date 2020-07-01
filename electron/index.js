const fs = require('fs');
const path = require('path');
const url = require('url');
const { app, ipcMain, BrowserWindow } = require('electron');

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

  init() {
    let rootPath = app.getAppPath();

    this.splashWindow = new BrowserWindow({
      width: this.splashOptions.windowWidth,
      height: this.splashOptions.windowHeight,
      frame: false,
      show: false,
      transparent: this.splashOptions.transparentWindow,
      webPreferences: {
        // Required to load file:// splash screen
        webSecurity: false
      }
    });

    let imagePath = path.join(rootPath, 'splash_assets', this.splashOptions.imageFileName);
    let imageUrl = '';
    let useFallback = false;
    try {
      imageUrl = url.pathToFileURL(imagePath).href;
    } catch (err) {
      useFallback = true;
      imageUrl = `./${this.splashOptions.imageFileName}`;
    }

    let splashHtml = this.splashOptions.customHtml || `
      <html style="width: 100%; height: 100%; margin: 0; overflow: hidden;">
      <body style="background-image: url('${imageUrl}'); background-position: center center; background-repeat: no-repeat; width: 100%; height: 100%; margin: 0; overflow: hidden;">       <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${this.splashOptions.textColor}; position: absolute; top: ${this.splashOptions.textPercentageFromTop}%; text-align: center; font-size: 10vw; width: 100vw;">
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

    if (useFallback) {
      this.splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`, {baseURLForDataURL: `file://${rootPath}/splash_assets/`});
    } else {
      this.splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`);
    }

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
