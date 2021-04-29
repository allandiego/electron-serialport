import { app, BrowserWindow, ipcMain } from 'electron';

import { createWindow } from './CreateWindow';
// import { createTray } from './Tray';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

function App() {
  const mainWindow = createWindow();
  // const tray = createTray();

  // tray.on('click', () => {
  //   console.log('Tray click');
  // });
}

// ipcMain.handle('openNewWindow', () => {
//   createWindow();
// });

// ipcMain.handle('getUserDataPath', async event => {
//   // mainWindow.webContents.send('user-data-path', app.getPath('userData'));
//   return app.getPath('userData');
// });

// ipcMain.handle('getStoreValue', (event, key) => {
//   return store.get(key);
// });

// ipcMain.handle('setStoreValue', (event, key, value) => {
//   return store.set(key, value);
// });

// ipcMain.on('open-dialog', async () => {
//   const returnedPath = dialog.showOpenDialogSync(mainWindow, {
//     title: 'Selecione a pasta',
//     buttonLabel: 'Selecionar',
//     // defaultPath: store.get('companiesConfigPath'),
//     properties: ['openDirectory'],
//   });

//   mainWindow.webContents.send('open-dialog-response', returnedPath);
// });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // This is required to be set to false beginning in Electron v9 otherwise
  // the SerialPort module can not be loaded in Renderer processes like we are doing
  // in this example. The linked Github issues says this will be deprecated starting in v10,
  // however it appears to still be changed and working in v11.2.0
  // Relevant discussion: https://github.com/electron/electron/issues/18397
  app.allowRendererProcessReuse = false;

  App();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) App();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
