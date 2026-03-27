// server.js
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');

const app = express();
const __dirnamePath = path.resolve();

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

// Body Parser alternativo
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

// Local Database Setup
const dataDir = path.join(__dirnamePath, 'data');
const ideiasFile = path.join(dataDir, 'ideias.json');
const roteirosFile = path.join(dataDir, 'roteiros.json');
const downloadsFile = path.join(dataDir, 'downloads.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(ideiasFile)) fs.writeFileSync(ideiasFile, JSON.stringify([]));
if (!fs.existsSync(roteirosFile)) fs.writeFileSync(roteirosFile, JSON.stringify([]));
if (!fs.existsSync(downloadsFile)) fs.writeFileSync(downloadsFile, JSON.stringify([]));

const thumbnailsDir = path.join(__dirnamePath, 'Downloads', 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, thumbnailsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'roteiro_thumb_' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// Helper functions for DB
const readDB = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeDB = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Public
app.use(express.static(path.join(__dirnamePath, 'public')));
app.use('/Downloads', express.static(path.join(__dirnamePath, 'Downloads')));



// Rotas
app.get('/', (req, res) => {
  res.render('homepage');
});

app.get('/ideias', (req, res) => {
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
  let roteiros = readDB(roteirosFile);
  let changes = false;
  
  roteiros = roteiros.map(r => {
    if (r.thumbnail) {
      const thumbPath = path.join(__dirnamePath, r.thumbnail.startsWith('/') ? r.thumbnail.substring(1) : r.thumbnail);
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
  let downloads = readDB(downloadsFile);
  let changes = false;

  const validDownloads = downloads.filter(d => {
    if (d.path) {
      const filePath = path.join(__dirnamePath, d.path.startsWith('/') ? d.path.substring(1) : d.path);
      if (!fs.existsSync(filePath)) {
        changes = true;
        return false;
      }
    }
    if (d.thumbnail && typeof d.thumbnail === 'string') {
      const thumbPath = path.join(__dirnamePath, d.thumbnail.startsWith('/') ? d.thumbnail.substring(1) : d.thumbnail);
      if (!fs.existsSync(thumbPath)) {
        d.thumbnail = null; // Remove reference to missing thumbnail
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
  res.render('pag_sobre');
});

app.get('/form_ideia', (req, res) => {
  res.render('pag_form_ideia');
});

app.get('/form_roteiro', (req, res) => {
  res.render('pag_form_roteiro');
});

app.get('/form_download', (req, res) => {
  res.render('pag_form_download');
});

const { execFile, spawn } = require("child_process");

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
    for (const cmd of pythonCmds) {
      try {
        pyProcess = spawn(cmd, [scriptPath, link, formatChoice], {
          shell: true,
          env: { ...process.env, PYTHONUNBUFFERED: "1" }
        });
        // Testa se o processo iniciou com sucesso
        if (pyProcess && pyProcess.pid) break;
      } catch (e) {
        pyProcess = null;
      }
    }
    if (!pyProcess || !pyProcess.pid) {
      res.write("data: ERROR:Python não encontrado. Instale Python e adicione ao PATH.\n\n");
      return res.end();
    }

    let currentTitle = "";
    let currentThumb = "";
    let finalPath = "";

    pyProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (line.trim()) {
          const text = line.trim();
          if (text.startsWith("TITLE:")) currentTitle = text.substring(6);
          if (text.startsWith("THUMBNAIL:")) currentThumb = text.substring(10);
          if (text.startsWith("DONE:")) finalPath = text.substring(5);
          res.write(`data: ${text}\n\n`);
        }
      }
    });

    pyProcess.stderr.on("data", (data) => {
      console.error("Python Erro:", data.toString());
    });

    pyProcess.on("close", (code) => {
      if (code === 0 && finalPath) {
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
      } else if (code === 9009) {
        res.write(`data: ERROR:Python não encontrado (código 9009). Instale o Python e marque a opção 'Add Python to PATH' durante a instalação.\n\n`);
      } else if (code === 1) {
        res.write(`data: ERROR:Erro no script Python. Verifique se o pacote 'pytubefix' está instalado: pip install pytubefix\n\n`);
      } else if (code !== 0) {
        res.write(`data: ERROR:Processo terminou com erro (código ${code})\n\n`);
      }
      res.end();
    });

  } else if (tipo === "img") {
    const downloadsDir = path.join(__dirnamePath, "Downloads");
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
    const fileName = `imagem_${Date.now()}.jpg`;
    const dest = path.join(downloadsDir, fileName);
    const absDest = path.resolve(dest);

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
    const downloadsDir = path.join(__dirnamePath, "Downloads");
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
    const dest = path.join(downloadsDir, `imagem_${Date.now()}.jpg`);

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

module.exports = app;
