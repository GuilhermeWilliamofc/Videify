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

module.exports = app;
