import { app, BrowserWindow } from 'electron';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;

export const createWindow = (): BrowserWindow => {
  // const image =
  //   process.platform === 'darwin'
  //     ? path.join(__dirname, 'assets', 'icon.icns')
  //     : path.join(__dirname, 'assets', 'icon.ico');

  // console.log('MAIN_WINDOW_WEBPACK_ENTRY', MAIN_WINDOW_WEBPACK_ENTRY);
  // console.log(
  //   'MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY',
  //   MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  // );

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    // icon: image,
    transparent: false,
    resizable: true,
    frame: true,
    // titleBarStyle: 'hidden', for custom-title-bar
    webPreferences: {
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: false, // protect against prototype pollution
      enableRemoteModule: true, // turn off remote
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false, // Allow Access-Control-Allow-Origin for external requests
      // preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, '/pages/index.html'));
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // mainWindow.removeMenu();
  // Disable the default Menu Bar
  // Menu.setApplicationMenu(null);

  // mainWindow.webContents.on('did-finish-load', async () => {
  //   // mainWindow.webContents.send('user-data-path', app.getPath('userData'));
  //   console.log('userData', app.getPath('userData'));
  //   // console.log('userDataPath', (app || remote.app).getPath('userData'));
  // });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  return mainWindow;
};
