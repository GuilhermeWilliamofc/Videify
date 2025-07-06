import express from 'express'
import {engine} from 'express-handlebars'
import path from 'path'
import mongoose from 'mongoose'
import session from 'express-session'
import flash from 'connect-flash'

const app = express()
const __dirname = path.resolve()

// Configurações
    // Sessão
        app.use(session({
            secret: 'qualquercoisa', // é uma chave para gerar a sessão
            resave: true, // Se estiver como true, a sessão será salva novamente no armazenamento do servidor toda vez que o usuário fizer uma requisição, mesmo que nada tenha mudado na sessão. Recomendação: Normalmente, deixe como false para evitar gravações desnecessárias e melhorar a performance.
            saveUninitialized: true // Se estiver como true, uma nova sessão será criada e salva mesmo que você não tenha colocado nenhum dado nela. Recomendação: Normalmente, deixe como false para só criar e salvar sessões quando realmente precisar guardar algum dado (por exemplo, quando o usuário faz login).
        }))
        app.use(flash())

    // Middleware
        app.use(function(requisicao, resposta, proximo){
            resposta.locals.success_msg = requisicao.flash('success_msg')
            resposta.locals.error_msg = requisicao.flash('error_msg')
            proximo()
            // para criar uma variável global você coloca resposta.locals.sua_variavel = 'sua variável'
        })

    // Alternativa do BodyParser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())

    // Handlebars
        app.engine('handlebars', engine()) // template padrão da aplicação
        app.set('view engine', 'handlebars')
        app.set('views', './views')
    // Mongoose
        mongoose.Promise = global.Promise // para evitar erros
        mongoose.connect('mongodb://localhost/blogapp').then(function(){
            console.log('Conectado ao Mongodb com sucesso!')
        }).catch(function(erro){
            console.log(`Houve um erro ao tentar se conectar ao Mongodb: ${erro}`)
        })
    // Public
        app.use(express.static(__dirname + '/public')) // para aceitar js e css no site

        app.use(function(requisicao, resposta, proximo){ // ao criar um middleware você passa além do req e res o parâmetro "next" também, você pode fazer "qualquer coisa" em um middleware
            console.log('Middleware chamado!')
            proximo() // não esqueça de colocar next no final do middleware, se não o middleware trava a aplicação
        })

// Rotas
    app.get('/', function(requisicao, resposta){
        resposta.render('homepage') // no metodo render, só precisa digitar o nome do arquivo renderbars no meu caso formulario
    })

// Outros
const porta = 8081
app.listen(porta, function(){
    console.log('Servidor rodando na URL: http://localhost:8081')
})