const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDevMode = require('electron-is-dev');
const { injectCapacitor } = require('@capacitor/electron');

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;
let splashWindow = null;

// Change this to false, to disable splash screen on startup.
let useSplashWindow = true;

// Next 4 lines setup and define items needed for the Electron version of the SplashScreen plugin
const showCapacitorSplash = () => {
  if(useSplashWindow) {
    splashWindow.show();
    mainWindow.hide();
  }
};
const hideCapacitorSplash = () => {
  if(useSplashWindow) {
    mainWindow.show();
    splashWindow.hide();
  }
};
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

// Create simple menu for easy dev-tools access, and for demo
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
  // Define our main window size
  mainWindow = new BrowserWindow({
    height: 920,
    width: 1600,
    show: false,
  });

  if (isDevMode) {
    // Set our above template to the Menu Object if we are in development mode, don't want users having the dev-tools.
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
    // If we are developers we might as well open the dev-tools by default.
    mainWindow.webContents.openDevTools();
  }

  // Only do splash screen stuff if the user has it enabled.
  if(useSplashWindow) {

    // Define default splash screen options
    let splashOptions = {
      imageFileName: "splash.gif", // Change this to splash.png for a static image
      windowWidth: 400,
      windowHeight: 400,
      textColor: '#43A8FF',
      loadingText: 'Loading',
      textPercentageFromTop: 75
    };

    // Attempt to get options for splash screen from capacitor.config.json
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

    // Set splash window look and size
    splashWindow = new BrowserWindow({
      width: splashOptions.windowWidth,
      height: splashOptions.windowHeight,
      frame: false,
      show: false,
    });

    // Define content for the splash window to load
    let splashHtml = `<html style="width: 100%; height: 100%; margin: 0; overflow: hidden;"><body style="background-image: url('./${splashOptions.imageFileName}'); background-position: center center; width: 100%; height: 100%; margin: 0; overflow: hidden;"><div style="color: ${splashOptions.textColor}; position: absolute; top: ${splashOptions.textPercentageFromTop}%; text-align: center; font-size: 10vw; width: 100vw;">${splashOptions.loadingText}</div></body></html>`;

    // Make sure when the mainWindow is closed we close the splash screen to avoid leaving the application running with no screens
    mainWindow.on('closed', () => {
      splashWindow.close();
    });

    // Load the defined content into the splash screen
    splashWindow.loadURL(`data:text/html;charset=UTF-8,${splashHtml}`, {baseURLForDataURL: `file://${__dirname}/splash_assets/`});

    // Once the splash screen has rendered and is being shown to the user, start loading the mainWindow content
    splashWindow.webContents.on('dom-ready', async () => {
      splashWindow.show();
      mainWindow.loadURL(await injectCapacitor(`file://${__dirname}/app/index.html`), {baseURLForDataURL: `file://${__dirname}/app/`});
    });

  } else {
    // Don't want to use a splash screen so just load the mainWindow content
    mainWindow.loadURL(await injectCapacitor(`file://${__dirname}/app/index.html`), {baseURLForDataURL: `file://${__dirname}/app/`});
  }

  // When the mainWindow content is rendered show the window and hide the splash screen if they are using one
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

// Define any IPC or other custom functionality below here
