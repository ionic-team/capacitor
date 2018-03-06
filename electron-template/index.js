const {app, BrowserWindow, Menu} = require('electron');
const isDevMode = require('electron-is-dev');

if (isDevMode) {
  require('electron-reload')(__dirname + '/www');
}

let mainWindow = null;

const menuTemplateDev = [
  {
    label: 'Options',
    submenu: [
      {
        label: 'Open Dev Tools',
        click() {
          mainWindow.openDevTools();
        },
      }
    ],
  },
];

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 920,
    width: 1600
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));

  if (isDevMode)
    mainWindow.webContents.openDevTools();

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
});

app.on('window-all-closed', () => {
  app.quit();
});