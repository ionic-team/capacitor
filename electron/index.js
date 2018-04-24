const fs = require('fs');
const path = require('path');
const { ipcMain, BrowserWindow } = require('electron');

function getURLFileContents(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      // console.error(err);
      if(err)
        reject(err);
      resolve(data.toString());
    });
  });
}

const injectCapacitor = async function(url) {
  try {
    // console.log(url.substr(url.indexOf('://') + 3));
    let urlFileContents = await getURLFileContents(url.substr(url.indexOf('://') + 3));
    let pathing = path.join(url.substr(url.indexOf('://') + 3), '../../node_modules/@capacitor/electron/dist/electron-bridge.js');
    // console.log(pathing);
    urlFileContents = urlFileContents.replace('<body>', `<body><script>window.require('${pathing.replace(/\\/g,'\\\\')}')</script>`);
    // console.log(urlFileContents);
    return 'data:text/html;charset=UTF-8,' + urlFileContents;
  } catch(e) {
    // console.error(e);
    return url;
  }
};

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
 */
  constructor(mainWindow, splashOptions) {
    this.mainWindowRef = null;
    this.splashWindow = null;

    if(!splashOptions) {
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
      autoHideLaunchSplash: splashOptions.autoHideLaunchSplash || true
    };

    this.mainWindowRef = mainWindow;

    try {
      let capConfigJson = JSON.parse(fs.readFileSync(`./capacitor.config.json`, 'utf-8'));
      this.splashOptions = Object.assign(
        this.splashOptions,
        capConfigJson.plugins.SplashScreen
      );
    } catch (e) {
      console.error(e.message);
    }

    ipcMain.on('showCapacitorSplashScreen', (event, options) => {
      this.show();
      if(options) {
        if(options.autoHide) {
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

    let rootPath = path.join(__dirname, '../../../');

    this.splashWindow = new BrowserWindow({
      width: this.splashOptions.windowWidth,
      height: this.splashOptions.windowHeight,
      frame: false,
      show: false,
      transparent: this.splashOptions.transparentWindow,
    });

    let splashHtml = `
      <html style="width: 100%; height: 100%; margin: 0; overflow: hidden;">
        <body style="background-image: url('./${this.splashOptions.imageFileName}'); background-position: center center; background-repeat: no-repeat; width: 100%; height: 100%; margin: 0; overflow: hidden;">
          <div style="color: ${this.splashOptions.textColor}; position: absolute; top: ${this.splashOptions.textPercentageFromTop}%; text-align: center; font-size: 10vw; width: 100vw; text-shadow: -0.6px -0.6px 0 #f4f4f4, 0.6px -0.6px 0 #f4f4f4, -0.6px 0.6px 0 #f4f4f4, 0.8px 0.6px 0 #f4f4f4">
            ${this.splashOptions.loadingText}
          </div>
        </body>
      </html>
    `;

    this.mainWindowRef.on('closed', () => {
      this.splashWindow.close();
    });

    this.splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`, {baseURLForDataURL: `file://${rootPath}/splash_assets/`});

    this.splashWindow.webContents.on('dom-ready', async () => {
      this.splashWindow.show();
      setTimeout(async () => {
        this.mainWindowRef.loadURL(await injectCapacitor(`file://${rootPath}/app/index.html`), {baseURLForDataURL: `file://${rootPath}/app/`});
      }, 4500);
    });

    if(this.splashOptions.autoHideLaunchSplash) {
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
  injectCapacitor,
  CapacitorSplashScreen
};
