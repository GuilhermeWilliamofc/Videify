// server.js
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

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
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirnamePath, 'views'));

// MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp')
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.log(`Erro ao conectar ao MongoDB: ${err}`));

// Public
app.use(express.static(path.join(__dirnamePath, 'public')));

// Middleware de exemplo
app.use((req, res, next) => {
  console.log('Middleware chamado!');
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.render('homepage');
});

app.get('/ideias', (req, res) => {
  res.render('pag_ideias');
});

app.get('/roteiros', (req, res) => {
  res.render('pag_roteiros');
});

app.get('/downloads', (req, res) => {
  res.render('pag_downloads');
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

const { execFile } = require("child_process");

app.post("/baixar", (req, res) => {
  const { tipo, link } = req.body;

  console.log("📩 Requisição recebida:", tipo, link);

  if (!tipo || !link) return res.status(400).send("Dados inválidos");

  if (tipo === "yt") {
    const scriptPath = path.join(__dirnamePath, "scripts", "baixar_youtube.py");

    execFile("python", [scriptPath, link], (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Erro ao executar script:", err);
        return res.status(500).send("Erro");
      }
      console.log("✅ Script executado:", stdout);
      return res.status(200).send("Vídeo baixado com sucesso");
    });
  } 
  
  else if (tipo === "img") {
    const dest = path.join(__dirnamePath, "public", "downloads", "imagem.jpg");

    fetch(link)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then(buf => {
        fs.writeFileSync(dest, Buffer.from(buf));
        console.log("✅ Imagem salva em:", dest);
        res.status(200).send("Imagem baixada com sucesso");
      })
      .catch(err => {
        console.error("❌ Erro ao baixar imagem:", err.message);
        res.status(500).send("Erro ao baixar imagem");
      });
  } 
  
  else {
    res.status(400).send("Tipo inválido");
  }
});

module.exports = app;
