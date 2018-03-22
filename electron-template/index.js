const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDevMode = require('electron-is-dev');
const { injectCapacitor } = require('@capacitor/electron');

let mainWindow = null;
let splashWindow = null;

// Change this to false, to disable splashscreen on startup.
let useSplashWindow = true;

// Create simple menu for easy devtools access, and for demo
const menuTemplateDev = [
  {
    label: 'Options',
    submenu: [
      {
        label: 'Open Dev Tools',
        click() {
          mainWindow.openDevTools();
        },
      },
    ],
  },
];

async function createWindow () {
  // Define our window size
  mainWindow = new BrowserWindow({
    height: 920,
    width: 1600,
    show: false,
  });

  if (isDevMode) {
    // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
    // If we are developers we might as well open the devtools by default.
    mainWindow.webContents.openDevTools();
  }

  if(useSplashWindow) {
    let splashOptions = {
      imageFileName: "splash.png",
      windowWidth: 400,
      windowHeight: 400,
      textColor: '#43A8FF',
      loadingText: 'Loading',
      textPercentageFromTop: 75
    };
    try {
      let FS = require('fs');
      let capConfigJson = JSON.parse(FS.readFileSync('./capacitor.config.json', 'utf-8'));
      splashOptions = Object.assign(
        splashOptions,
        capConfigJson.plugins.SplashScreen
      );
    } catch(e) {
      console.error(e);
    }
    splashWindow = new BrowserWindow({
      width: 480,
      height: 800,
      frame: false,
      show: false,
    });
    let splashHtml = `<html style="width: 100%; height: 100%; margin: 0; overflow: hidden;"><body style="background-image: url('./${splashOptions.imageFileName}'); background-position: center center; width: 100%; height: 100%; margin: 0; overflow: hidden;"><div style="color: ${splashOptions.textColor}; position: absolute; top: ${splashOptions.textPercentageFromTop}%; text-align: center; font-size: 10vw; width: 100vw;">${splashOptions.loadingText}</div></body></html>`;
    mainWindow.on('closed', () => {
      splashWindow.close();
    });
    splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`, {baseURLForDataURL: `file://${__dirname}/splash_assets/`});
    splashWindow.webContents.on('dom-ready', async () => {
      splashWindow.show();
      mainWindow.loadURL(await injectCapacitor(`file://${__dirname}/app/index.html`), {baseURLForDataURL: `file://${__dirname}/app/`});
    });
  } else {
    mainWindow.loadURL(await injectCapacitor(`file://${__dirname}/app/index.html`), {baseURLForDataURL: `file://${__dirname}/app/`});
  }

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.show();
    if(useSplashWindow) {
      splashWindow.hide();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function showCapacitorSplash() {
  if(useSplashWindow) {
    splashWindow.show();
    mainWindow.hide();
  }
}
function hideCapacitorSplash() {
  if(useSplashWindow) {
    mainWindow.show();
    splashWindow.hide();
  }
}

ipcMain.on('showCapacitorSplashScreen', (event, options) => {
  showCapacitorSplash();
  if(options) {
    if(options.autoHide) {
      let showTime = options.showDuration || 3000;
      setTimeout(() => {
        hideCapacitorSplash();
    }, showTime);
    }
  }
});

ipcMain.on('hideCapacitorSplashScreen', (event, options) => {
  hideCapacitorSplash();
});
