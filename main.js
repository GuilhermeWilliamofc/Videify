// main.js
const { app, BrowserWindow, Menu, MenuItem } = require('electron');
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
      contextIsolation: false,
      spellcheck: true // Garante que o corretor ortográfico esteja ativo
    }
  });

  // Habilitar menu de contexto (clique direito)
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    // Sugestões do corretor ortográfico
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => mainWindow.webContents.replaceMisspelling(suggestion)
      }));
    }

    if (params.dictionarySuggestions.length > 0) {
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // Ações padrão de edição
    if (params.isEditable) {
      menu.append(new MenuItem({ label: 'Desfazer', role: 'undo' }));
      menu.append(new MenuItem({ label: 'Refazer', role: 'redo' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ label: 'Recortar', role: 'cut' }));
      menu.append(new MenuItem({ label: 'Copiar', role: 'copy' }));
      menu.append(new MenuItem({ label: 'Colar', role: 'paste' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ label: 'Selecionar Tudo', role: 'selectAll' }));
    } else if (params.selectionText) {
      menu.append(new MenuItem({ label: 'Copiar', role: 'copy' }));
    }

    if (menu.items.length > 0) {
      menu.popup(mainWindow);
    }
  });

  // Remove a barra de menu inferior/superior padrão
  mainWindow.setMenuBarVisibility(false);

  expressApp.listen(8081, () => {
    console.log('Servidor Express rodando em http://localhost:8081');
    mainWindow.loadURL('http://localhost:8081');
  });
}

app.on('browser-window-created', (e, win) => {
  win.setMenuBarVisibility(false);
  win.setMenu(null);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

