// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./server'); // Importa o app Express

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'public', '/images/favicon.ico'), // Caminho para seu ícone
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      contextIsolation: false
    }
  });

  // Remove a barra de menu
  mainWindow.setMenuBarVisibility(false);
  // Ou, para remover completamente:
  // mainWindow.removeMenu();

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
