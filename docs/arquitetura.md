# Arquitetura do Videify

**Versão:** 1.0.0  
**Última atualização:** 30/07/2026

---

## 1. Visão Geral da Arquitetura

Videify é uma aplicação desktop **monolítica** construída com Electron, que encapsula um servidor Express local e scripts Python para processamento pesado. A arquitetura prioriza **autonomia offline** e **simplicidade de deployment**.

### 1.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON SHELL                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              BROWSER WINDOW (localhost:8081)          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         FRONTEND (Handlebars + Bootstrap)       │  │  │
│  │  │  - Views                                        │  │  │
│  │  │  - CSS (Bootstrap + Custom)                     │  │  │
│  │  │  - JavaScript (Vanilla + SSE)                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │ HTTP                             │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              EXPRESS SERVER (Node.js)                 │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Routes Layer                                   │  │  │
│  │  │  - GET /ideias, /roteiros, /downloads, etc     │  │  │
│  │  │  - POST /nova_ideia, /baixar-stream, etc       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Middleware Layer                               │  │  │
│  │  │  - express-session (in-memory)                  │  │  │
│  │  │  - connect-flash                                │  │  │
│  │  │  - multer (file uploads)                        │  │  │
│  │  │  - express-handlebars                           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic Layer                           │  │  │
│  │  │  - CRUD operations (ideias, roteiros)           │  │  │
│  │  │  - File system sync                             │  │  │
│  │  │  - Python spawn (downloads, rembg)              │  │  │
│  │  │  - SSE streaming                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           PERSISTENCE LAYER (File System)             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  %APPDATA%\Videify\                             │  │  │
│  │  │  - ideias.json                                  │  │  │
│  │  │  - roteiros.json                                │  │  │
│  │  │  - downloads.json                               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Downloads\Videify\                             │  │  │
│  │  │  - Video - [Nome]/                              │  │  │
│  │  │  - thumbnails/                                  │  │  │
│  │  │  - imagens/                                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         EXTERNAL PROCESSES (Python + FFmpeg)          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  scripts/baixar_youtube.py (pytubefix)          │  │  │
│  │  │  scripts/remover_fundo.py (rembg)               │  │  │
│  │  │  scripts/ffmpeg.exe (audio/video merge)         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         DISCORD INTEGRATION (discord-rpc)             │  │
│  │  - discord_presence.js                                │  │
│  │  - Rich Presence updates                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Camadas da Aplicação

### 2.1 Camada de Apresentação (Frontend)

**Tecnologias:**
- **Express-Handlebars 7.0.7** - Template engine server-side
- **Bootstrap 5** - Framework CSS responsivo
- **Vanilla JavaScript** - Scripts cliente

**Responsabilidades:**
- Renderizar views a partir de dados do backend
- Enviar formulários via POST
- Escutar Server-Sent Events (SSE) para progresso
- Interações básicas de UI (modals, tooltips)

**Estrutura de Arquivos:**
```
views/
├── layouts/
│   └── main.handlebars          # Layout master com navbar
├── partials/
│   └── _navbar.handlebars       # Componente navbar reutilizável
├── homepage.handlebars
├── pag_ideias.handlebars
├── pag_form_ideia.handlebars
├── pag_roteiros.handlebars
├── pag_form_roteiro.handlebars
├── pag_downloads.handlebars
├── pag_form_download.handlebars
├── pag_remover_fundo.handlebars
└── pag_sobre.handlebars

public/
├── css/
│   ├── bootstrap.min.css
│   └── style.css                # Estilos customizados
├── js/
│   ├── bootstrap.bundle.min.js
│   └── app.js                   # Scripts cliente
└── images/
    ├── VideifyLogo.png
    ├── icon.ico
    └── favicon.ico
```

**Padrões de Design:**
- **Server-Side Rendering (SSR):** Todas as páginas renderizadas no backend
- **Progressive Enhancement:** Funciona sem JavaScript (formulários básicos)
- **SSE para tempo real:** Usado em downloads e remoção de fundo

---

### 2.2 Camada de Aplicação (Backend)

**Tecnologias:**
- **Express.js 4.18.2** - Framework web
- **Express-Session 1.17.3** - Gerenciamento de sessões
- **Connect-Flash 0.1.1** - Mensagens flash
- **Multer 2.1.1** - Upload de arquivos
- **Node-Fetch 3.3.2** - HTTP requests

**Arquivo Principal:** `server.js` (monolítico)

**Responsabilidades:**
- Gerenciar rotas HTTP
- CRUD de ideias, roteiros e downloads
- Orquestrar processos Python
- Streaming de progresso via SSE
- Sincronização file system ↔ JSON
- Validação de dados

**Estrutura de Rotas:**

| Tipo | Rota | Função |
|------|------|--------|
| **GET** | `/` | Homepage |
| **GET** | `/ideias` | Lista ideias |
| **GET** | `/form_ideia` | Formulário nova ideia |
| **GET** | `/editar_ideia/:id` | Formulário editar ideia |
| **POST** | `/nova_ideia` | Salvar nova ideia |
| **POST** | `/editar_ideia/:id` | Atualizar ideia |
| **POST** | `/deletar_ideia/:id` | Deletar ideia |
| **GET** | `/roteiros` | Lista roteiros |
| **GET** | `/form_roteiro` | Formulário novo roteiro |
| **GET** | `/editar_roteiro/:id` | Formulário editar roteiro |
| **POST** | `/novo_roteiro` | Salvar roteiro (com upload) |
| **POST** | `/editar_roteiro/:id` | Atualizar roteiro |
| **POST** | `/deletar_roteiro/:id` | Deletar roteiro |
| **GET** | `/downloads` | Lista downloads |
| **GET** | `/form_download` | Formulário download |
| **POST** | `/baixar-stream` | Download streaming (SSE) |
| **POST** | `/open-folder` | Abrir pasta no explorer |
| **GET** | `/remover_fundo` | Página remoção fundo |
| **POST** | `/api/remover_fundo` | Processar remoção (SSE) |
| **GET** | `/sobre` | Página sobre |
| **POST** | `/api/presence_ping` | Ping Discord presence |

---

### 2.3 Camada de Persistência

**Tecnologia:** File System (JSON)

**Localização dos Dados:**
```
%APPDATA%\Videify\
├── ideias.json
├── roteiros.json
└── downloads.json

%USERPROFILE%\Downloads\Videify\
├── Video - [Nome]/
│   ├── video.mp4
│   ├── audio.mp3
│   ├── audio.opus
│   └── thumbnail.jpg
├── thumbnails/
│   └── roteiro_thumb_*.jpg
└── imagens/
    └── *.jpg, *.png, *.webp
```

**Operações:**
- **Read:** `fs.readFileSync()` + `JSON.parse()`
- **Write:** `JSON.stringify()` + `fs.writeFileSync()`
- **Migração:** Copia de `data/` local para `%APPDATA%` na primeira inicialização
- **Sincronização:** Varre diretório físico e atualiza JSON

**Schemas:**

**ideias.json:**
```json
[
  {
    "id": "string (timestamp)",
    "nome": "string",
    "descricao": "string",
    "tag": "string"
  }
]
```

**roteiros.json:**
```json
[
  {
    "id": "string (timestamp)",
    "titulo": "string",
    "descricao": "string",
    "introducao": "string",
    "desenvolvimento": "string",
    "conclusao": "string",
    "estado": "conceito|em_producao|concluido",
    "thumbnail": "string (path)"
  }
]
```

**downloads.json:**
```json
[
  {
    "id": "string (timestamp)",
    "title": "string",
    "type": "yt_video|yt_mp3|yt_opus|img",
    "path": "string",
    "thumbnail": "string",
    "date": "ISO 8601 string"
  }
]
```

---

### 2.4 Camada de Processamento Externo

**Python Scripts:**

**1. baixar_youtube.py**
- **Dependência:** pytubefix
- **Input:** URL do YouTube, tipo (video/mp3/opus)
- **Output:** Arquivo de mídia + thumbnail
- **Comunicação:** stdout (progresso) + exit code

**Fluxo:**
```
1. Recebe URL via argumento
2. Usa pytubefix para buscar streams
3. Baixa stream de vídeo/áudio
4. Se vídeo: baixa áudio separado
5. Combina com FFmpeg
6. Baixa thumbnail
7. Salva em Downloads/Videify/Video - [Nome]/
8. Emite progresso via print()
```

**2. remover_fundo.py**
- **Dependência:** rembg, Pillow
- **Input:** Path da imagem
- **Output:** Imagem sem fundo (PNG)
- **Comunicação:** stdout (progresso) + exit code

**Fluxo:**
```
1. Recebe path via argumento
2. Carrega imagem com Pillow
3. Processa com rembg (modelo u2net)
4. Salva como PNG com alpha channel
5. Retorna path do resultado
```

**3. ffmpeg.exe**
- **Uso:** Combinar audio + video streams do YouTube
- **Comando típico:**
```bash
ffmpeg -i video.mp4 -i audio.m4a -c copy output.mp4
```

---

### 2.5 Camada de Desktop (Electron)

**Arquivo Principal:** `main.js`

**Responsabilidades:**
- Criar janela do Electron (BrowserWindow)
- Iniciar servidor Express
- Carregar URL `http://localhost:8081`
- Gerenciar ciclo de vida da aplicação
- Integrar com Discord Rich Presence

**Configuração da Janela:**
```javascript
{
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true
  },
  icon: './public/images/icon.ico'
}
```

**Eventos:**
- `app.on('ready')` → Inicia servidor + cria janela
- `app.on('window-all-closed')` → Encerra aplicação (exceto macOS)
- `app.on('activate')` → Recria janela se fechada (macOS)

---

### 2.6 Integração Discord

**Arquivo:** `discord_presence.js`

**Tecnologia:** discord-rpc 4.0.1

**Funcionamento:**
1. Cliente RPC conecta ao Discord via IPC
2. Backend chama `updateActivity(section)` ao mudar de página
3. Frontend faz ping em `/api/presence_ping` a cada minuto
4. Após 5 minutos sem ping → marca como "Ocioso"

**Estados Possíveis:**
- "Organizando ideias"
- "Escrevendo roteiro"
- "Baixando mídias"
- "Editando imagens"
- "Ocioso"

---

## 3. Fluxos de Dados

### 3.1 Fluxo de CRUD (Ideias/Roteiros)

```
[Usuário]
   ↓ (preenche formulário)
[Frontend] → POST /nova_ideia
   ↓
[Express Route Handler]
   ↓ (valida dados)
[Business Logic]
   ↓ (lê JSON, adiciona item, salva)
[File System] ← fs.writeFileSync(ideias.json)
   ↓ (retorna sucesso)
[Flash Message] → "Ideia criada com sucesso!"
   ↓
[Redirect] → GET /ideias
   ↓
[Renderiza lista atualizada]
```

### 3.2 Fluxo de Download do YouTube

```
[Usuário] → Submete URL + tipo
   ↓
[Express] → POST /baixar-stream
   ↓ (abre SSE connection)
[SSE Stream] ← res.setHeader('Content-Type', 'text/event-stream')
   ↓
[Spawn Python] → python baixar_youtube.py <url> <tipo>
   ↓
[Python stdout] → "Downloading... 25%"
   ↓
[Parse progress] → res.write('data: {"progress": 25}\n\n')
   ↓ (loop até 100%)
[Python exit(0)]
   ↓
[Atualiza downloads.json]
   ↓
[SSE] → res.write('data: {"done": true, "path": "..."}\n\n')
   ↓
[Frontend] → Fecha conexão SSE
   ↓
[Exibe mensagem de sucesso]
```

### 3.3 Fluxo de Sincronização de Downloads

```
[GET /downloads] → Acessa página
   ↓
[Lê downloads.json]
   ↓
[Varre Downloads/Videify/]
   ↓
[Para cada pasta/arquivo encontrado:]
   ├─ Já existe no JSON? → Pula
   └─ Não existe? → Adiciona ao JSON
   ↓
[Para cada item no JSON:]
   ├─ Arquivo existe? → Mantém
   └─ Arquivo não existe? → Remove do JSON
   ↓
[Salva JSON atualizado]
   ↓
[Renderiza lista sincronizada]
```

### 3.4 Fluxo de Upload de Thumbnail

```
[Formulário de roteiro] → Inclui <input type="file">
   ↓
[Multer middleware] → Recebe arquivo
   ↓ (valida tipo MIME)
[Salva em Downloads/Videify/thumbnails/]
   ↓
[Gera nome único] → roteiro_thumb_<timestamp>.jpg
   ↓
[Armazena path no objeto roteiro]
   ↓
[Salva roteiros.json]
```

---

## 4. Decisões Arquiteturais

### 4.1 Por que Monolítico?

**Prós:**
- Simplicidade de deployment (um único executável)
- Sem necessidade de orquestração de microserviços
- Latência zero entre componentes
- Ideal para aplicação desktop single-user

**Contras:**
- Difícil escalar horizontalmente (não aplicável aqui)
- Tudo roda em um processo (crash = app para)

**Decisão:** Monolítico é ideal para desktop apps offline.

---

### 4.2 Por que JSON em vez de SQLite?

**Prós:**
- Simplicidade extrema (fs.readFileSync + JSON.parse)
- Human-readable (usuário pode editar manualmente)
- Zero setup (sem driver de BD)
- Backup trivial (copiar arquivos)

**Contras:**
- Performance ruim com muitos registros (>1000)
- Sem queries complexas
- Race conditions em escrita concorrente

**Decisão:** JSON é suficiente para volume esperado (<500 itens). Migrar para SQLite se crescer.

---

### 4.3 Por que Python Scripts em vez de Node.js Nativo?

**Prós:**
- pytubefix é mais confiável que bibliotecas Node
- rembg tem modelo de IA pronto e otimizado
- Isolamento de processos (crash do Python não derruba app)

**Contras:**
- Usuário precisa instalar Python separadamente
- Comunicação via stdout é menos robusta que APIs

**Decisão:** Benefícios superam custos. Incluir instalador Python no futuro.

---

### 4.4 Por que SSE em vez de WebSockets?

**Prós:**
- Simplicidade (apenas HTTP)
- Unidirecional (backend → frontend) é suficiente
- Suportado nativamente por Express

**Contras:**
- Não permite comunicação bidirecional
- Reconexão manual necessária

**Decisão:** SSE é perfeito para progresso de downloads. WebSockets seria overkill.

---

### 4.5 Por que Express-Session em Memória?

**Prós:**
- Simples (sem Redis ou file store)
- Suficiente para desktop single-user

**Contras:**
- Sessões perdidas ao reiniciar app
- Não suporta múltiplos processos

**Decisão:** Memória é ideal. Flash messages não precisam persistir.

---

## 5. Padrões de Código

### 5.1 Nomenclatura

**Variáveis:**
- `camelCase` para JavaScript
- `snake_case` para Python

**Arquivos:**
- `kebab-case.js` para scripts
- `PascalCase.handlebars` para componentes
- `lowercase.json` para dados

**Rotas:**
- `/kebab-case` para URLs
- `/api/kebab-case` para endpoints API

### 5.2 Tratamento de Erros

**Backend:**
```javascript
try {
  // operação
} catch (error) {
  console.error('Erro:', error);
  req.flash('error', 'Mensagem amigável');
  res.redirect('/');
}
```

**Python:**
```python
try:
    # operação
except Exception as e:
    print(f"ERRO: {str(e)}", file=sys.stderr)
    sys.exit(1)
```

### 5.3 Validação

**Frontend (HTML5):**
```html
<input type="text" required minlength="3">
```

**Backend (Express):**
```javascript
if (!req.body.nome || req.body.nome.trim() === '') {
  req.flash('error', 'Nome é obrigatório');
  return res.redirect('/form_ideia');
}
```

---

## 6. Segurança

### 6.1 Ameaças Mitigadas

| Ameaça | Mitigação |
|--------|-----------|
| **XSS** | Handlebars escapa HTML automaticamente |
| **Path Traversal** | Validação de paths antes de fs operations |
| **File Upload Abuse** | Multer limita tipos MIME e tamanho |
| **SQL Injection** | Não aplicável (sem SQL) |
| **CSRF** | Não aplicável (localhost only) |

### 6.2 Limitações de Segurança

- **Sem autenticação:** Qualquer processo local pode acessar :8081
- **Dados em texto plano:** JSON não criptografado
- **Python RCE:** Se usuário editar scripts Python maliciosamente

**Justificativa:** Aplicação desktop single-user não requer autenticação robusta.

---

## 7. Performance

### 7.1 Benchmarks Esperados

| Operação | Tempo Esperado |
|----------|----------------|
| Criar ideia | <50ms |
| Listar 100 ideias | <100ms |
| Upload thumbnail (2MB) | <500ms |
| Sincronizar 50 downloads | <1s |
| Download vídeo 1080p | 1-5min (dependente de rede) |
| Remoção de fundo (5MB) | 5-30s |

### 7.2 Gargalos Conhecidos

1. **Leitura de JSON a cada request** → Considerar cache em memória
2. **Sincronização de downloads** → Varrer diretório é O(n)
3. **Remoção de fundo** → Limitado por CPU/GPU

### 7.3 Otimizações Futuras

- Cache de JSON em memória (invalidar ao modificar)
- Worker threads para sincronização assíncrona
- Lazy loading de thumbnails na listagem

---

## 8. Escalabilidade

### 8.1 Limites Atuais

| Entidade | Limite Recomendado | Limite Técnico |
|----------|-------------------|----------------|
| Ideias | 500 | ~10.000 (performance degrada) |
| Roteiros | 200 | ~5.000 |
| Downloads | 1.000 | ~50.000 (sync lenta) |
| Thumbnail size | 5MB | 10MB (Multer) |

### 8.2 Estratégias de Crescimento

**Se usuário tiver >1.000 downloads:**
1. Implementar paginação
2. Migrar para SQLite
3. Índices para busca rápida

**Se app crescer para multi-user:**
1. Adicionar autenticação
2. Migrar para PostgreSQL
3. Separar backend em API REST

---

## 9. Deploy e Build

### 9.1 Processo de Build

```bash
npm run build
```

**Ferramentas:**
- **electron-packager** - Empacota app para Windows x64
- **postbuild.js** - Copia assets e scripts Python

**Output:**
```
release-builds/
└── Videify-win32-x64/
    ├── Videify.exe
    ├── resources/
    │   └── app.asar (código empacotado)
    ├── scripts/
    │   ├── baixar_youtube.py
    │   ├── remover_fundo.py
    │   └── ffmpeg.exe
    └── [DLLs do Electron]
```

### 9.2 Distribuição

**Método Atual:** ZIP manual

**Futuro:**
- Instalador NSIS/Squirrel
- Auto-update via electron-updater
- Assinatura de código (evitar Windows SmartScreen)

---

## 10. Testes

### 10.1 Estratégia de Testes

**Unitários (Jest):**
- Funções de manipulação de JSON
- Parsing de progresso do Python
- Validação de inputs

**Integração:**
- Rotas Express (Supertest)
- CRUD completo de ideias/roteiros
- Upload de arquivos

**E2E (Playwright):**
- Fluxo completo: criar → editar → deletar
- Download do YouTube
- Remoção de fundo

### 10.2 Coverage Alvo

- **Unitários:** >80%
- **Integração:** >60%
- **E2E:** Fluxos principais (happy path)

---

## 11. Monitoramento e Logs

### 11.1 Logs Atuais

**Console do Electron:**
- Erros de servidor
- Spawns de Python
- Mensagens de debug

**Logs Python:**
- stderr para erros
- stdout para progresso

### 11.2 Melhorias Futuras

- Winston/Bunyan para logs estruturados
- Rotação de logs por data
- Níveis: debug, info, warn, error
- Log de telemetria (opt-in): crashes, performance

---

## 12. Tecnologias Futuras

### 12.1 Considerações

| Área | Tecnologia Atual | Alternativa Futura |
|------|------------------|-------------------|
| Desktop | Electron | Tauri (menor tamanho) |
| BD | JSON | SQLite (melhor performance) |
| Frontend | Handlebars | React/Vue (SPA) |
| Backend | Express monolito | Fastify + módulos |
| Python | Spawn | WASM (rembg compilado) |

### 12.2 Roadmap Técnico

**2026 Q4:**
- Migrar para SQLite
- Implementar cache de dados

**2027 Q1:**
- Refatorar frontend para SPA
- API REST separada

**2027 Q2:**
- Build para macOS e Linux
- Auto-update implementado

---

## 13. Referências Técnicas

- [Electron Documentation](https://www.electronjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [pytubefix GitHub](https://github.com/JuanBindez/pytubefix)
- [rembg Documentation](https://github.com/danielgatis/rembg)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

---

**Última revisão:** 30/07/2026  
**Próxima revisão:** 30/10/2026
