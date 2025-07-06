// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./server'); // Importa o app Express

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  expressApp.listen(8081, () => {
    console.log('Servidor Express rodando em http://localhost:8081');
    mainWindow.loadURL('http://localhost:8081');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
