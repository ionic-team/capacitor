const {app, BrowserWindow, Menu} = require('electron');
const isDevMode = require('electron-is-dev');
const { injectCapacitor } = require('@capacitor/electron');

let mainWindow = null;

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

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.show();
  });

  // Render our app onto the page.
  mainWindow.loadURL(
    await injectCapacitor(`file://${__dirname}/app/index.html`),
    {baseURLForDataURL: `file://${__dirname}/app/`}
  );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin')
    app.quit();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null)
    createWindow();
});