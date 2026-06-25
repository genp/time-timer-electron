const path = require('path');
const { app, BrowserWindow } = require('electron');

const appIcon = path.join(__dirname, 'clock_icon.png');

function createWindow () {
  const win = new BrowserWindow({
    width: 460,
    height: 640,
    minWidth: 380,
    minHeight: 560,
    title: 'Time Timer',
    icon: appIcon,
    backgroundColor: '#f3f2ef',
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') app.dock.setIcon(appIcon);
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
