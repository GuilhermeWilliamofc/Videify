// server.js
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const { shell } = require('electron');
const { setActivity, pingPresence } = require('./discord_presence');

const app = express();
const __dirnamePath = path.resolve();

// ============================================================
// CAMINHOS PERSISTENTES — independentes da pasta do programa
// ============================================================

// Dados JSON ficam em %APPDATA%\Videify
const APPDATA_DIR  = path.join(process.env.APPDATA || path.join(require('os').homedir(), '.videify'), 'Videify');
// Mídias ficam em C:\Users\<user>\Downloads\Videify
const DOWNLOADS_DIR = path.join(require('os').homedir(), 'Downloads', 'Videify');
const THUMBNAILS_DIR = path.join(DOWNLOADS_DIR, 'thumbnails');

// Garante que as pastas existam
[APPDATA_DIR, DOWNLOADS_DIR, THUMBNAILS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---- Migração automática (roda só uma vez) ----
// Se o usuário tinha dados na pasta antiga do projeto, movemos para o novo local.
const OLD_DATA_DIR = path.join(__dirnamePath, 'data');
const OLD_DOWNLOADS_DIR = path.join(__dirnamePath, 'Downloads');

const migrateIfNeeded = (oldFile, newFile) => {
    if (fs.existsSync(oldFile) && !fs.existsSync(newFile)) {
        fs.copyFileSync(oldFile, newFile);
        console.log(`✅ Migrado: ${path.basename(oldFile)} -> AppData`);
    }
};

// Migra os arquivos JSON de dados
const migrateOldData = () => {
    if (!fs.existsSync(OLD_DATA_DIR)) return;
    ['ideias.json', 'roteiros.json', 'downloads.json'].forEach(f => {
        migrateIfNeeded(path.join(OLD_DATA_DIR, f), path.join(APPDATA_DIR, f));
    });

    // Migra pastas de vídeo da pasta antiga
    if (fs.existsSync(OLD_DOWNLOADS_DIR)) {
        const items = fs.readdirSync(OLD_DOWNLOADS_DIR);
        items.forEach(item => {
            const src = path.join(OLD_DOWNLOADS_DIR, item);
            const dest = path.join(DOWNLOADS_DIR, item);
            if (!fs.existsSync(dest)) {
                try {
                    fs.renameSync(src, dest);
                    console.log(`✅ Movido: ${item} -> Downloads\\Videify`);
                } catch(e) {
                    console.warn(`⚠️ Não foi possível mover ${item}:`, e.message);
                }
            }
        });
    }
};

migrateOldData();

// ---- Banco de dados ----
const dataDir = APPDATA_DIR;
const ideiasFile    = path.join(dataDir, 'ideias.json');
const roteirosFile  = path.join(dataDir, 'roteiros.json');
const downloadsFile = path.join(dataDir, 'downloads.json');

if (!fs.existsSync(ideiasFile))    fs.writeFileSync(ideiasFile,    JSON.stringify([]));
if (!fs.existsSync(roteirosFile))  fs.writeFileSync(roteirosFile,  JSON.stringify([]));
if (!fs.existsSync(downloadsFile)) fs.writeFileSync(downloadsFile, JSON.stringify([]));

// ---- Multer (thumbnails dos roteiros salvas em Downloads/Videify/thumbnails) ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, THUMBNAILS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'roteiro_thumb_' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// Helper functions for DB
const readDB  = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeDB = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Sessão
app.use(session({
  secret: 'qualquercoisa',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

// Middleware para mensagens flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirnamePath, 'views'));

// Arquivos estáticos
app.use(express.static(path.join(__dirnamePath, 'public')));
// Serve arquivos de media do diretório persistente
app.use('/Downloads', express.static(DOWNLOADS_DIR));

// Função para sincronizar downloads físicos com o banco de dados
const syncDownloadsFromDisk = () => {
    if (!fs.existsSync(DOWNLOADS_DIR)) return;

    let downloads = readDB(downloadsFile);
    const existingPaths = new Set(downloads.map(d => d.path));
    let changes = false;

    const items = fs.readdirSync(DOWNLOADS_DIR);

    for (const item of items) {
        const fullItemPath = path.join(DOWNLOADS_DIR, item);
        const stats = fs.statSync(fullItemPath);

        // Caso 1: Pastas de Video (Youtube)
        if (stats.isDirectory() && item.startsWith("Video - ")) {
            const folderFiles = fs.readdirSync(fullItemPath);
            const mediaFile = folderFiles.find(f => f.endsWith('.mp4') || f.endsWith('.mp3') || f.endsWith('.opus'));
            
            if (mediaFile) {
                const dbPath = `/Downloads/${item}/${mediaFile}`;
                if (!existingPaths.has(dbPath)) {
                    let type = "yt_video";
                    if (mediaFile.endsWith(".mp3")) type = "yt_mp3";
                    if (mediaFile.endsWith(".opus")) type = "yt_opus";

                    const hasThumb = folderFiles.includes("thumbnail.jpg");
                    
                    downloads.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        title: mediaFile.replace(/\.(mp4|mp3|opus)$/, ''),
                        type: type,
                        path: dbPath,
                        thumbnail: hasThumb ? `/Downloads/${item}/thumbnail.jpg` : null,
                        date: stats.birthtime.toISOString()
                    });
                    existingPaths.add(dbPath);
                    changes = true;
                }
            }
        }
        // Caso 2: Imagens avulsas na raiz
        else if (stats.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(item)) {
            const dbPath = `/Downloads/${item}`;
            if (!existingPaths.has(dbPath)) {
                downloads.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    title: item,
                    type: "img",
                    path: dbPath,
                    thumbnail: dbPath,
                    date: stats.birthtime.toISOString()
                });
                existingPaths.add(dbPath);
                changes = true;
            }
        }
    }

    if (changes) {
        writeDB(downloadsFile, downloads);
    }
};



// Rotas
app.get('/', (req, res) => {
  setActivity('Página Inicial');
  res.render('homepage');
});

app.get('/ideias', (req, res) => {
  setActivity('Minhas Ideias');
  const ideias = readDB(ideiasFile);
  res.render('pag_ideias', { ideias });
});

app.post('/nova_ideia', (req, res) => {
  const { nome, descricao, tag } = req.body;
  if (!nome) return res.status(400).send("Título obrigatório");
  const ideias = readDB(ideiasFile);
  const novaIdeia = { id: Date.now().toString(), nome, descricao, tag };
  ideias.push(novaIdeia);
  writeDB(ideiasFile, ideias);
  req.flash('success_msg', 'Ideia salva com sucesso!');
  res.redirect('/ideias');
});

app.post('/deletar_ideia/:id', (req, res) => {
  let ideias = readDB(ideiasFile);
  ideias = ideias.filter(i => i.id !== req.params.id);
  writeDB(ideiasFile, ideias);
  req.flash('success_msg', 'Ideia deletada!');
  res.redirect('/ideias');
});

app.get('/editar_ideia/:id', (req, res) => {
  setActivity('Editando Ideia');
  const ideias = readDB(ideiasFile);
  const ideia = ideias.find(i => i.id === req.params.id);
  if (!ideia) {
    req.flash('error_msg', 'Ideia não encontrada!');
    return res.redirect('/ideias');
  }
  res.render('pag_form_ideia', { ideia, isEdit: true });
});

app.post('/editar_ideia/:id', (req, res) => {
  const { nome, descricao, tag } = req.body;
  if (!nome) return res.status(400).send("Título obrigatório");
  const ideias = readDB(ideiasFile);
  const index = ideias.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    ideias[index] = { ...ideias[index], nome, descricao, tag };
    writeDB(ideiasFile, ideias);
    req.flash('success_msg', 'Ideia atualizada!');
  }
  res.redirect('/ideias');
});

app.get('/roteiros', (req, res) => {
  setActivity('Meus Roteiros');
  let roteiros = readDB(roteirosFile);
  let changes = false;
  
  roteiros = roteiros.map(r => {
    if (r.thumbnail) {
      const thumbPath = path.join(DOWNLOADS_DIR, r.thumbnail.replace('/Downloads/', '').replace(/^\//, ''));
      if (!fs.existsSync(thumbPath)) {
        r.thumbnail = '';
        changes = true;
      }
    }
    
    // --- Tempo Estimado de Leitura ---
    const textoTotal = (r.introducao || '') + ' ' + (r.desenvolvimento || '') + ' ' + (r.conclusao || '');
    const numPalavras = textoTotal.trim().split(/\s+/).filter(w => w.length > 0).length;
    r.tempo_leitura = numPalavras > 0 ? Math.ceil(numPalavras / 200) : 0;
    
    return r;
  });

  if (changes) {
    writeDB(roteirosFile, roteiros);
  }

  res.render('pag_roteiros', { roteiros });
});

app.post('/novo_roteiro', upload.single('thumbnail_file'), (req, res) => {
  const { titulo, descricao, introducao, desenvolvimento, conclusao, estado } = req.body;
  if (!titulo) return res.status(400).send("Título obrigatório");
  const roteiros = readDB(roteirosFile);

  let finalThumbnail = '';
  if (req.file) {
    finalThumbnail = `/Downloads/thumbnails/${req.file.filename}`;
  }

  const novoRoteiro = { id: Date.now().toString(), titulo, descricao, introducao, desenvolvimento, conclusao, estado: estado || 'conceito', thumbnail: finalThumbnail };
  roteiros.push(novoRoteiro);
  writeDB(roteirosFile, roteiros);
  req.flash('success_msg', 'Roteiro salvo com sucesso!');
  res.redirect('/roteiros');
});

app.post('/deletar_roteiro/:id', (req, res) => {
  let roteiros = readDB(roteirosFile);
  roteiros = roteiros.filter(r => r.id !== req.params.id);
  writeDB(roteirosFile, roteiros);
  req.flash('success_msg', 'Roteiro deletado!');
  res.redirect('/roteiros');
});

app.get('/editar_roteiro/:id', (req, res) => {
  setActivity('Editando Roteiro');
  const roteiros = readDB(roteirosFile);
  const roteiro = roteiros.find(r => r.id === req.params.id);
  if (!roteiro) {
    req.flash('error_msg', 'Roteiro não encontrado!');
    return res.redirect('/roteiros');
  }
  res.render('pag_form_roteiro', { roteiro, isEdit: true });
});

app.post('/editar_roteiro/:id', upload.single('thumbnail_file'), (req, res) => {
  const { titulo, descricao, introducao, desenvolvimento, conclusao, estado } = req.body;
  if (!titulo) return res.status(400).send("Título obrigatório");
  const roteiros = readDB(roteirosFile);
  const index = roteiros.findIndex(r => r.id === req.params.id);
  
  if (index !== -1) {
    let finalThumbnail = roteiros[index].thumbnail || '';
    if (req.file) {
      finalThumbnail = `/Downloads/thumbnails/${req.file.filename}`;
    }

    roteiros[index] = { ...roteiros[index], titulo, descricao, introducao, desenvolvimento, conclusao, estado: estado || 'conceito', thumbnail: finalThumbnail };
    writeDB(roteirosFile, roteiros);
    req.flash('success_msg', 'Roteiro atualizado!');
  }
  res.redirect('/roteiros');
});

app.get('/downloads', (req, res) => {
  setActivity('Meus Downloads');
  syncDownloadsFromDisk();
  let downloads = readDB(downloadsFile);
  let changes = false;

  const validDownloads = downloads.filter(d => {
    if (d.path) {
      const relPath = d.path.replace('/Downloads/', '').replace(/^\//, '');
      const filePath = path.join(DOWNLOADS_DIR, relPath);
      if (!fs.existsSync(filePath)) {
        changes = true;
        return false;
      }
    }
    if (d.thumbnail && typeof d.thumbnail === 'string') {
      const relThumb = d.thumbnail.replace('/Downloads/', '').replace(/^\//, '');
      const thumbPath = path.join(DOWNLOADS_DIR, relThumb);
      if (!fs.existsSync(thumbPath)) {
        d.thumbnail = null;
        changes = true;
      }
    }
    return true;
  });

  if (changes) {
    writeDB(downloadsFile, validDownloads);
    downloads = validDownloads;
  }

  res.render('pag_downloads', { downloads: downloads.reverse() });
});

app.get('/sobre', (req, res) => {
  setActivity('Página de Sobre');
  res.render('pag_sobre');
});

app.get('/form_ideia', (req, res) => {
  setActivity('Adicionando Nova Ideia');
  res.render('pag_form_ideia');
});

app.get('/form_roteiro', (req, res) => {
  setActivity('Criando Novo Roteiro');
  res.render('pag_form_roteiro');
});

app.get('/form_download', (req, res) => {
  setActivity('Baixando Vídeo');
  res.render('pag_form_download');
});

app.get('/remover_fundo', (req, res) => {
  setActivity('Remoção de Fundo Inteligente');
  res.render('pag_remover_fundo');
});

app.post('/api/presence_ping', (req, res) => {
  pingPresence();
  res.status(200).send("OK");
});

app.post('/open-folder', (req, res) => {
    const { path: filePath } = req.body;
    
    if (!filePath) return res.status(400).send("Caminho não fornecido");
    
    // Tenta primeiro o caminho absoluto (ex: vindo do Python via DONE:)
    // Se não existir, tenta resolver como caminho relativo ao DOWNLOADS_DIR
    let fullPath = filePath;
    if (!fs.existsSync(fullPath)) {
        const cleanPath = filePath.replace('/Downloads/', '').replace(/^\//, '');
        fullPath = path.join(DOWNLOADS_DIR, cleanPath);
    }
    
    console.log("📂 Abrindo arquivo/pasta:", fullPath);
    
    if (fs.existsSync(fullPath)) {
      shell.showItemInFolder(fullPath);
      res.status(200).send("OK");
    } else {
      console.error("❌ Arquivo não encontrado:", fullPath);
      res.status(404).send("Arquivo não encontrado");
    }
});

const { execFile, spawn } = require("child_process");

// Rota para buscar informações de playlist
app.post("/api/playlist-info", (req, res) => {
  const { url } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!url) {
    res.write("data: " + JSON.stringify({success: false, error: "URL não fornecida"}) + "\n\n");
    return res.end();
  }

  const scriptPath = path.join(__dirnamePath, "scripts", "buscar_playlist.py");
  const pythonCmds = ["python", "python3", "py"];
  let pyProcess = null;
  let foundCmd = null;

  // Encontra comando Python disponível
  for (const cmd of pythonCmds) {
    try {
      const { spawnSync } = require('child_process');
      const check = spawnSync(cmd, ['--version'], { shell: true });
      if (check.status === 0) {
        foundCmd = cmd;
        break;
      }
    } catch (e) {}
  }

  if (!foundCmd) {
    res.write("data: " + JSON.stringify({
      success: false, 
      error: "Python não encontrado. Instale o Python e marque 'Add Python to PATH'."
    }) + "\n\n");
    return res.end();
  }

  pyProcess = spawn(foundCmd, [scriptPath, url], {
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
  });

  if (!pyProcess || !pyProcess.pid) {
    res.write("data: " + JSON.stringify({
      success: false,
      error: "Não foi possível iniciar o processo Python."
    }) + "\n\n");
    return res.end();
  }

  let outputBuffer = "";

  pyProcess.stdout.on("data", (data) => {
    outputBuffer += data.toString();
    const lines = outputBuffer.split("\n");
    
    // Processa todas as linhas completas
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line) {
        console.log(`📤 Enviando linha (${line.length} chars):`, line.substring(0, 100) + "...");
        res.write(`data: ${line}\n\n`);
      }
    }
    
    // Mantém a última linha incompleta no buffer
    outputBuffer = lines[lines.length - 1];
  });

  pyProcess.stderr.on("data", (data) => {
    console.error("Python Playlist Erro:", data.toString());
  });

  pyProcess.on("close", (code) => {
    // Processa qualquer dado restante no buffer
    if (outputBuffer.trim()) {
      const finalLine = outputBuffer.trim();
      console.log(`📤 Enviando linha FINAL (${finalLine.length} chars):`, finalLine.substring(0, 100) + "...");
      res.write(`data: ${finalLine}\n\n`);
      
      // Debug: verifica se é o JSON de sucesso
      try {
        const parsed = JSON.parse(finalLine);
        if (parsed.success === true) {
          console.log(`✅ JSON final contém ${parsed.videos?.length} vídeos`);
        }
      } catch (e) {
        console.error("⚠️ Linha final não é JSON válido");
      }
    }
    
    if (code !== 0) {
      res.write("data: " + JSON.stringify({
        success: false,
        error: `Processo terminou com erro (código ${code})`
      }) + "\n\n");
    }
    
    console.log("🏁 Stream finalizado, código de saída:", code);
    res.end();
  });
});

app.post("/baixar-stream", (req, res) => {
  const { tipo, link, formato } = req.body;
  const formatChoice = formato || "video";

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!tipo || !link) {
    res.write("data: ERROR:Dados inválidos\n\n");
    return res.end();
  }

  if (tipo === "yt") {
    const scriptPath = path.join(__dirnamePath, "scripts", "baixar_youtube.py");
    // Tenta 'python', 'python3' e 'py' para compatibilidade com diferentes instalações do Windows
    // shell: true é necessário para que o Electron encontre o Python no PATH do sistema
    // mesmo quando iniciado por clique duplo (sem terminal)
    const pythonCmds = ["python", "python3", "py"];
    let pyProcess = null;
    let foundCmd = null;

    // Tenta encontrar qual comando do Python funciona no sistema
    for (const cmd of pythonCmds) {
      try {
        const { spawnSync } = require('child_process');
        // Usamos shell: true para garantir que comandos como 'py' sejam encontrados no Windows
        const check = spawnSync(cmd, ['--version'], { shell: true });
        if (check.status === 0) {
          foundCmd = cmd;
          break;
        }
      } catch (e) {
        // Continua para o próximo comando
      }
    }

    if (!foundCmd) {
      res.write("data: ERROR:Python não encontrado. Instale o Python (https://www.python.org/) e ATENÇÃO: Marque a caixa 'Add Python to PATH' na instalação.\n\n");
      return res.end();
    }

    // Usamos aspas extras em volta dos caminhos para evitar erros com espaços no Windows
    // O shell: true do spawn pode ter problemas com caminhos com espaços se não forem escapados
    pyProcess = spawn(foundCmd, [`"${scriptPath}"`, `"${link}"`, formatChoice, `"${DOWNLOADS_DIR}"`], {
      shell: true,
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });

    if (!pyProcess || !pyProcess.pid) {
      res.write("data: ERROR:Não foi possível iniciar o processo Python.\n\n");
      return res.end();
    }

    let currentTitle = "";
    let currentThumb = "";
    let finalPath = "";
    let errorType = "";
    let hasError = false;

    pyProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          const text = line.trim();
          if (text.startsWith("TITLE:")) currentTitle = text.substring(6);
          if (text.startsWith("THUMBNAIL:")) currentThumb = text.substring(10);
          if (text.startsWith("DONE:")) finalPath = text.substring(5);
          if (text.startsWith("ERROR_TYPE:")) {
            errorType = text.substring(11);
            hasError = true;
          }
          if (text.startsWith("ERROR:")) {
            hasError = true;
          }
          res.write(`data: ${text}\n\n`);
        }
      }
    });

    pyProcess.stderr.on("data", (data) => {
      const output = data.toString();
      console.error("Python Erro:", output);
      
      // Erros críticos antes do try/catch do Python
      if (output.includes("can't open file") && output.includes("Errno 2")) {
          res.write(`data: ERROR_TYPE:SCRIPT_NOT_FOUND\n\n`);
          res.write(`data: ERROR:O Python não conseguiu localizar o script de download. Verifique se a pasta 'scripts' existe.\n\n`);
          hasError = true;
      } else if (output.includes("ModuleNotFoundError") || output.includes("No module named")) {
          res.write(`data: ERROR_TYPE:MISSING_DEPENDENCIES\n\n`);
          res.write(`data: ERROR:Dependências Python não instaladas. Execute: pip install pytubefix\n\n`);
          hasError = true;
      }
    });

    pyProcess.on("close", (code) => {
      if (code === 0 && finalPath && !hasError) {
        const downloads = readDB(downloadsFile);
        downloads.push({
            id: Date.now().toString(),
            title: currentTitle || path.basename(finalPath),
            type: `yt_${formatChoice}`,
            path: `/Downloads/${path.basename(path.dirname(finalPath)).replace(/\\/g, '/')}/${path.basename(finalPath)}`,
            thumbnail: currentThumb ? `/Downloads/${currentThumb.replace(/\\/g, '/')}` : null,
            date: new Date().toISOString()
        });
        writeDB(downloadsFile, downloads);
      } else if (hasError) {
        // Erros já foram enviados via stdout com ERROR_TYPE e ERROR
        console.log(`Download falhou com tipo de erro: ${errorType || 'desconhecido'}`);
      } else if (code === 9009) {
        res.write(`data: ERROR_TYPE:PYTHON_NOT_FOUND\n\n`);
        res.write(`data: ERROR:Python não encontrado (código 9009). Instale o Python e marque 'Add Python to PATH'.\n\n`);
      } else if (code === 2) {
        res.write(`data: ERROR_TYPE:FILE_ACCESS_ERROR\n\n`);
        res.write(`data: ERROR:Erro de acesso ao arquivo (código 2). Verifique se o caminho não contém caracteres especiais.\n\n`);
      } else if (code !== 0) {
        res.write(`data: ERROR_TYPE:PROCESS_ERROR\n\n`);
        res.write(`data: ERROR:Processo terminou com erro (código ${code})\n\n`);
      }
      res.end();
    });

  } else if (tipo === "img") {
    if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
    const fileName = `imagem_${Date.now()}.jpg`;
    const dest = path.join(DOWNLOADS_DIR, fileName);
    const absDest = dest;

    res.write(`data: TITLE:${fileName}\n\n`);
    res.write("data: STATUS:Baixando imagem...\n\n");
    res.write("data: PROGRESS:50\n\n");

    fetch(link)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then(buf => {
        fs.writeFileSync(dest, Buffer.from(buf));
        res.write("data: PROGRESS:100\n\n");
        res.write(`data: DONE:${absDest}\n\n`);
        
        const downloads = readDB(downloadsFile);
        downloads.push({
            id: Date.now().toString(),
            title: fileName,
            type: "img",
            path: `/Downloads/${fileName}`,
            thumbnail: `/Downloads/${fileName}`,
            date: new Date().toISOString()
        });
        writeDB(downloadsFile, downloads);
        res.end();
      })
      .catch(err => {
        res.write(`data: ERROR:${err.message}\n\n`);
        res.end();
      });
  } else {
    res.write("data: ERROR:Tipo inválido\n\n");
    res.end();
  }
});

app.post("/baixar", (req, res) => {
  const { tipo, link } = req.body;

  console.log("📩 Requisição recebida:", tipo, link);

  if (!tipo || !link) return res.status(400).send("Dados inválidos");

  if (tipo === "yt") {
    const scriptPath = path.join(__dirnamePath, "scripts", "baixar_youtube.py");

    execFile("python", [scriptPath, link], (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Erro ao executar script:", err);
        req.flash('error_msg', 'Erro ao baixar vídeo.');
        return res.redirect('/form_download');
      }
      console.log("✅ Script executado:", stdout);
      req.flash('success_msg', 'Vídeo baixado com sucesso!');
      return res.redirect('/form_download');
    });
  } 
  
  else if (tipo === "img") {
    if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
    const dest = path.join(DOWNLOADS_DIR, `imagem_${Date.now()}.jpg`);

    fetch(link)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then(buf => {
        fs.writeFileSync(dest, Buffer.from(buf));
        console.log("✅ Imagem salva em:", dest);
        req.flash('success_msg', 'Imagem baixada com sucesso!');
        res.redirect('/form_download');
      })
      .catch(err => {
        console.error("❌ Erro ao baixar imagem:", err.message);
        req.flash('error_msg', 'Erro ao baixar imagem.');
        res.redirect('/form_download');
      });
  } 
  
  else {
    req.flash('error_msg', 'Tipo inválido.');
    res.redirect('/form_download');
  }
});

// Remover fundo
app.post("/api/remover_fundo", upload.single('image_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhuma imagem selecionada.");
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  setActivity('Editando imagem');

  const scriptPath = path.join(__dirnamePath, "scripts", "remover_fundo.py");
  if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  
  const ext = path.extname(req.file.originalname) || ".png";
  const outputFileName = `bgless_${Date.now()}${ext === '.jpg' || ext === '.jpeg' ? '.png' : ext}`;
  const outputPath = path.join(DOWNLOADS_DIR, outputFileName);
  
  const pythonCmds = ["python", "python3", "py"];
  let pyProcess = null;
  let foundCmd = null;

  for (const cmd of pythonCmds) {
    try {
      const { spawnSync } = require('child_process');
      const check = spawnSync(cmd, ['--version'], { shell: true });
      if (check.status === 0) {
        foundCmd = cmd;
        break;
      }
    } catch (e) {}
  }

  if (!foundCmd) {
    res.write("data: ERROR:Python não encontrado.\n\n");
    setActivity('Ocioso');
    return res.end();
  }

  pyProcess = spawn(foundCmd, [`"${scriptPath}"`, `"${req.file.path}"`, `"${outputPath}"`], {
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
  });

  if (!pyProcess) {
    res.write("data: ERROR:Falha ao iniciar processo do Python.\n\n");
    setActivity('Ocioso');
    return res.end();
  }

  pyProcess.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        res.write(`data: ${line.trim()}\n\n`);
      }
    }
  });

  pyProcess.stderr.on("data", (data) => {
    console.error("Python BG Remover Erro:", data.toString());
  });

  pyProcess.on("close", (code) => {
    if (code === 0 && fs.existsSync(outputPath)) {
        const downloads = readDB(downloadsFile);
        downloads.push({
            id: Date.now().toString(),
            title: outputFileName,
            type: "img",
            path: `/Downloads/${outputFileName}`,
            thumbnail: `/Downloads/${outputFileName}`,
            date: new Date().toISOString()
        });
        writeDB(downloadsFile, downloads);
    } else {
        res.write(`data: ERROR:Processo terminou com codigo ${code}\n\n`);
    }
    setActivity('Ocioso');
    res.end();
  });
});

module.exports = app;
