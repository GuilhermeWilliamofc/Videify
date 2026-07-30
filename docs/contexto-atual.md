# Contexto Atual do Projeto Videify

**Última atualização:** 30/07/2026

## Visão Geral

Videify é uma aplicação desktop completa para criadores de conteúdo, permitindo organizar ideias, criar roteiros estruturados e baixar mídias do YouTube e imagens. A aplicação funciona 100% offline, armazenando dados localmente em arquivos JSON.

## Status do Projeto

- **Versão:** 1.0.0
- **Status:** Produção
- **Plataforma:** Windows x64 (Electron)
- **Linguagens:** JavaScript (Node.js), Python
- **Licença:** MIT

## Stack Tecnológico Atual

### Backend
- **Node.js** + **Express 4.18.2** - Servidor local (porta 8081)
- **Express-Handlebars 7.0.7** - Template engine
- **Express-Session 1.17.3** - Gerenciamento de sessões
- **Connect-Flash 0.1.1** - Mensagens flash
- **Multer 2.1.1** - Upload de arquivos

### Desktop
- **Electron 30.0.0** - Framework desktop
- **Discord-RPC 4.0.1** - Integração Rich Presence

### Frontend
- **Bootstrap 5** - Framework CSS
- **Vanilla JavaScript** - Scripts cliente
- **Server-Sent Events (SSE)** - Progresso em tempo real

### Processamento
- **Python 3.x**:
  - pytubefix - Download YouTube
  - rembg + Pillow - Remoção de fundo IA
- **FFmpeg** - Conversão áudio/vídeo

### Armazenamento
- **JSON local** em `%APPDATA%\Videify`
- **Mídias** em `C:\Users\<user>\Downloads\Videify`

## Estrutura de Dados Atual

### Localização dos Arquivos

```
%APPDATA%\Videify\
├── ideias.json
├── roteiros.json
└── downloads.json

%USERPROFILE%\Downloads\Videify\
├── Video - [Nome do Vídeo]/
│   ├── video.mp4
│   ├── audio.mp3
│   └── thumbnail.jpg
└── imagens/
```

### Schemas JSON

**ideias.json:**
```json
[
  {
    "id": "timestamp_string",
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
    "id": "timestamp_string",
    "titulo": "string",
    "descricao": "string",
    "introducao": "string",
    "desenvolvimento": "string",
    "conclusao": "string",
    "estado": "conceito|em_producao|concluido",
    "thumbnail": "path_string"
  }
]
```

**downloads.json:**
```json
[
  {
    "id": "timestamp_string",
    "title": "string",
    "type": "yt_video|yt_mp3|yt_opus|img",
    "path": "path_string",
    "thumbnail": "path_string",
    "date": "ISO_date_string"
  }
]
```

## Funcionalidades Implementadas

### 1. Minhas Ideias
- ✅ Criar ideias com nome, descrição e tags
- ✅ Editar ideias existentes
- ✅ Deletar ideias
- ✅ Filtrar por tags
- ✅ Listagem completa

### 2. Meus Roteiros
- ✅ Criar roteiros estruturados (Introdução/Desenvolvimento/Conclusão)
- ✅ Upload de thumbnail local
- ✅ Estados de produção (Conceito, Em Produção, Concluído)
- ✅ Cálculo automático de tempo de leitura (~200 palavras/min)
- ✅ Editar roteiros
- ✅ Deletar roteiros
- ✅ Validação de thumbnails ausentes

### 3. Meus Downloads
- ✅ Download de vídeos do YouTube (MP4 máxima qualidade)
- ✅ Download de áudio MP3 (alta qualidade)
- ✅ Download de áudio Opus (codec moderno)
- ✅ Download de imagens via URL
- ✅ Download automático de thumbnails do YouTube
- ✅ Progresso em tempo real (SSE)
- ✅ Sincronização automática com file system
- ✅ Abrir pasta no explorador
- ✅ Validação de integridade

### 4. Remover Fundo
- ✅ Upload de imagem local
- ✅ Remoção de fundo com IA (rembg)
- ✅ Exportação em PNG com transparência
- ✅ Progresso em tempo real (SSE)

### 5. Discord Rich Presence
- ✅ Exibir atividade atual no Discord
- ✅ Detecção de ociosidade (5 minutos)
- ✅ Application ID configurável

### 6. Sobre
- ✅ Informações do projeto
- ✅ Créditos e licença

## Rotas Disponíveis

### Páginas (GET)
- `/` - Homepage
- `/ideias` - Listagem de ideias
- `/form_ideia` - Formulário nova ideia
- `/editar_ideia/:id` - Editar ideia
- `/roteiros` - Listagem de roteiros
- `/form_roteiro` - Formulário novo roteiro
- `/editar_roteiro/:id` - Editar roteiro
- `/downloads` - Listagem de downloads
- `/form_download` - Formulário download
- `/remover_fundo` - Remoção de fundo
- `/sobre` - Sobre o projeto

### APIs (POST)
- `/nova_ideia` - Criar ideia
- `/editar_ideia/:id` - Atualizar ideia
- `/deletar_ideia/:id` - Deletar ideia
- `/novo_roteiro` - Criar roteiro (com upload)
- `/editar_roteiro/:id` - Atualizar roteiro
- `/deletar_roteiro/:id` - Deletar roteiro
- `/baixar-stream` - Download streaming (SSE)
- `/api/remover_fundo` - Remover fundo (SSE)
- `/open-folder` - Abrir pasta no explorer
- `/api/presence_ping` - Ping Discord presence

## Arquivos Principais

```
Videify/
├── main.js              # Entry point Electron
├── server.js            # Servidor Express + todas as rotas
├── discord_presence.js  # Integração Discord
├── package.json         # Dependências Node
│
├── views/               # Templates Handlebars
│   ├── layouts/
│   ├── partials/
│   └── [8 páginas].handlebars
│
├── public/              # Assets estáticos
│   ├── css/
│   ├── js/
│   └── images/
│
├── scripts/             # Scripts Python + FFmpeg
│   ├── baixar_youtube.py
│   ├── remover_fundo.py
│   ├── ffmpeg.exe
│   └── postbuild.js
│
└── docs/                # Documentação (esta pasta)
```

## Sistema de Migração

Ao iniciar, a aplicação:
1. Verifica se existem dados em `data/` local (pasta antiga)
2. Migra automaticamente para `%APPDATA%\Videify`
3. Move mídias para `Downloads\Videify`
4. Preserva integridade dos dados

## Sincronização de Downloads

A cada acesso à página de downloads:
1. Varre o diretório físico `Downloads\Videify`
2. Identifica pastas de vídeo (`Video - <nome>`)
3. Identifica imagens avulsas (jpg, png, webp)
4. Adiciona ao JSON se não existir
5. Remove entradas de arquivos deletados

## Validações de Integridade

- Verifica existência de thumbnails ao carregar roteiros
- Remove referências de arquivos deletados
- Atualiza banco automaticamente
- Logs de erros em console

## Scripts Disponíveis

```bash
npm start        # Inicia aplicação Electron
npm run build    # Compila para Windows x64
npm run postbuild # Pós-processamento do build
```

## Instalação de Dependências

```bash
# Node.js
npm install

# Python (via instalar_dependencias.bat)
pip install pytubefix rembg pillow
```

## Comandos Python Suportados

O sistema tenta executar Python usando (nesta ordem):
1. `python`
2. `python3`
3. `py`

## Porta do Servidor

- **Padrão:** 8081
- **Configurável em:** `server.js` (variável `const PORT = 8081`)

## Limitações Conhecidas

1. Apenas Windows x64 (build atual)
2. FFmpeg empacotado apenas para Windows
3. Discord Presence requer Discord Desktop rodando
4. Download YouTube depende de pytubefix funcionando
5. Remoção de fundo requer RAM suficiente para modelos IA

## Dependências Críticas

### Node.js
```json
{
  "electron": "^30.0.0",
  "express": "^4.18.2",
  "express-handlebars": "^7.0.7",
  "discord-rpc": "^4.0.1",
  "multer": "^2.1.1",
  "node-fetch": "^3.3.2"
}
```

### Python
- pytubefix (fork atualizado do pytube)
- rembg (modelo u2net para remoção de fundo)
- Pillow (manipulação de imagens)

## Próximas Funcionalidades Planejadas

(Veja o arquivo PRD.md para detalhes)

## Observações Técnicas

- Aplicação monolítica (backend + frontend integrados)
- Sem conexão externa necessária após instalação
- Dados persistem em AppData (não removidos em desinstalação)
- SSE para feedback em tempo real
- Session baseada em memória (não persiste entre reinicializações)
- Python executado via spawn com shell:true (Windows)

## Segurança

- Sem autenticação (aplicação local single-user)
- Dados armazenados em texto plano (JSON)
- Sem conexões externas além de YouTube
- Multer configurado para aceitar apenas imagens (roteiros/remoção fundo)
- Validação básica de URLs de download

## Performance

- Armazenamento JSON em memória (recarregado a cada acesso)
- Sincronização de downloads pode ser lenta com muitos arquivos
- Remoção de fundo pode demorar 5-30s dependendo da imagem
- Download YouTube velocidade depende da conexão

## Convenções de Código

- IDs gerados via timestamp (`Date.now().toString()`)
- Paths com barras normais (`/`) convertidas para Windows quando necessário
- Templates Handlebars com prefixo `pag_` para páginas
- Scripts Python em `scripts/` com encoding UTF-8
- Logs de erro em console (não em arquivo)

---

**Nota:** Este documento deve ser atualizado sempre que houver mudanças significativas na aplicação.
