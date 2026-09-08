const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'iconB.ico')
    : path.join(__dirname, '..', 'assets', 'iconB.ico');

  console.log('ICONO:', iconPath);

  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    icon: iconPath,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  let indexPath;

  if (app.isPackaged) {
    indexPath = path.join(
      app.getAppPath(),
      'dist',
      'asescomp-app',
      'browser',
      'index.html'
    );
  } else {
    indexPath = path.join(
      __dirname,
      '..',
      'dist',
      'asescomp-app',
      'browser',
      'index.html'
    );
  }

  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
