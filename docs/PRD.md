# PRD - Product Requirements Document
## Videify - Ferramenta All-in-One para Criadores de Conteúdo

**Versão:** 1.1.0   
**Data:** 31/07/2026   
**Status:** Produção

---

## 1. Visão do Produto

### 1.1 Propósito
Videify é uma aplicação desktop que centraliza o fluxo de trabalho completo de criadores de conteúdo, desde a ideação até a produção, incluindo ferramentas para organização de ideias, planejamento de roteiros e download de mídias necessárias para edição.

### 1.2 Problema a Resolver
Criadores de conteúdo atualmente precisam usar múltiplas ferramentas separadas:
- Bloco de notas ou apps cloud para ideias
- Google Docs/Notion para roteiros
- Sites externos com anúncios para baixar mídias do YouTube
- Ferramentas online pagas para remover fundo de imagens
- Gestão manual de arquivos baixados

**Videify resolve isso fornecendo uma solução offline, rápida e integrada.**

### 1.3 Público-Alvo
- YouTubers e criadores de vídeo
- Editores de vídeo freelancers
- Produtores de conteúdo para redes sociais
- Estudantes e educadores criando material audiovisual
- Qualquer pessoa que trabalhe com produção de vídeo regularmente

### 1.4 Objetivos do Produto
1. **Simplicidade:** Interface intuitiva sem curva de aprendizado
2. **Autonomia:** Funcionar 100% offline após instalação
3. **Velocidade:** Operações rápidas sem espera de cloud sync
4. **Confiabilidade:** Dados persistentes e backup automático
5. **Integração:** Todas as ferramentas em um único lugar

---

## 2. Funcionalidades

### 2.1 Minhas Ideias

#### Descrição
Sistema simples de anotação de ideias para vídeos futuros, com organização por tags.

#### User Stories
- Como criador, quero anotar rapidamente uma ideia antes de esquecê-la
- Como criador, quero categorizar minhas ideias por temas
- Como criador, quero filtrar ideias por tags específicas
- Como criador, quero editar ideias conforme evoluo o conceito
- Como criador, quero deletar ideias que não fazem mais sentido

#### Requisitos Funcionais
- **RF-01:** Criar ideia com nome, descrição longa e tag
- **RF-02:** Editar qualquer campo de uma ideia existente
- **RF-03:** Deletar ideia com confirmação
- **RF-04:** Listar todas as ideias ordenadas por data de criação (mais recente primeiro)
- **RF-05:** Filtrar ideias por tag selecionada
- **RF-06:** Tags são texto livre (não predefinidas)
- **RF-07:** Feedback visual após operações (mensagens flash)

#### Requisitos Não Funcionais
- **RNF-01:** Operações devem ser instantâneas (<100ms)
- **RNF-02:** Dados persistem em JSON local
- **RNF-03:** Validação de campos obrigatórios no frontend e backend

---

### 2.2 Meus Roteiros

#### Descrição
Editor estruturado de roteiros para vídeos, dividido em três atos clássicos (Introdução, Desenvolvimento, Conclusão), com upload de thumbnail e controle de status de produção.

#### User Stories
- Como criador, quero escrever um roteiro estruturado profissionalmente
- Como criador, quero saber quanto tempo meu roteiro levará para ser narrado
- Como criador, quero anexar uma thumbnail ao roteiro para visualização rápida
- Como criador, quero marcar o status de produção do roteiro
- Como criador, quero ver todos os roteiros organizados por status

#### Requisitos Funcionais
- **RF-08:** Criar roteiro com:
  - Título (obrigatório)
  - Descrição curta (obrigatório)
  - Introdução (texto longo)
  - Desenvolvimento (texto longo)
  - Conclusão (texto longo)
  - Estado (Conceito/Em Produção/Concluído)
  - Thumbnail (upload opcional)
- **RF-09:** Calcular tempo estimado de leitura (~200 palavras/minuto)
- **RF-10:** Validar e avisar se thumbnail está ausente
- **RF-11:** Editar roteiro existente preservando thumbnail anterior
- **RF-12:** Deletar roteiro e thumbnail associada
- **RF-13:** Upload de thumbnail suporta JPG, PNG, WebP
- **RF-14:** Thumbnails armazenadas em `Downloads/Videify/thumbnails/`
- **RF-15:** Listar roteiros com indicador visual de estado

#### Requisitos Não Funcionais
- **RNF-04:** Textarea deve suportar textos longos sem lag
- **RNF-05:** Upload de thumbnail limitado a 5MB
- **RNF-06:** Thumbnails redimensionadas automaticamente para preview
- **RNF-07:** Validação de integridade ao carregar (remover referências de thumbnails deletadas)

---

### 2.3 Meus Downloads

#### Descrição
Sistema avançado de download de mídias do YouTube (vídeo/áudio) e imagens da web, com sincronização automática entre file system e banco de dados.

#### User Stories
- Como criador, quero baixar vídeos do YouTube na máxima qualidade
- Como criador, quero baixar apenas o áudio em MP3 para economizar espaço
- Como criador, quero baixar áudio em Opus para melhor qualidade
- Como criador, quero baixar imagens de qualquer URL
- Como criador, quero ver o progresso do download em tempo real
- Como criador, quero abrir diretamente a pasta do arquivo baixado
- Como criador, quero que meus downloads sejam organizados automaticamente

#### Requisitos Funcionais
- **RF-16:** Baixar vídeo do YouTube:
  - Formato: MP4
  - Qualidade: Máxima disponível (1080p+)
  - Áudio e vídeo combinados via FFmpeg
  - Thumbnail baixada automaticamente
  - Organizado em pasta `Video - [Nome]`
- **RF-17:** Baixar áudio MP3 do YouTube:
  - Bitrate: Alta qualidade
  - Metadados preservados
  - Salvo na pasta do vídeo
- **RF-18:** Baixar áudio Opus do YouTube:
  - Codec moderno de alta eficiência
  - Salvo na pasta do vídeo
- **RF-19:** Baixar imagem via URL:
  - Formatos: JPG, PNG, WebP, GIF
  - Salva diretamente em `Downloads/Videify/`
- **RF-20:** Progresso em tempo real via Server-Sent Events (SSE)
- **RF-21:** Sincronização automática:
  - Varrer diretório físico ao acessar página
  - Adicionar ao JSON downloads não registrados
  - Remover do JSON arquivos deletados
- **RF-22:** Botão "Abrir pasta" abre explorer no local exato
- **RF-23:** Listar downloads com thumbnail, título, tipo e data

#### Requisitos Não Funcionais
- **RNF-08:** SSE deve emitir eventos a cada 5% de progresso
- **RNF-09:** Timeout de download: 30 minutos
- **RNF-10:** Validação de URL do YouTube antes de processar
- **RNF-11:** Tratamento de erros do pytubefix com mensagens amigáveis
- **RNF-12:** FFmpeg deve combinar streams silenciosamente
- **RNF-13:** Sincronização não deve bloquear carregamento da página

---

### 2.4 Remover Fundo Inteligente

#### Descrição
Ferramenta de remoção de fundo de imagens usando IA (rembg), com upload local e progresso em tempo real.

#### User Stories
- Como criador, quero remover fundo de imagens para usar em thumbnails
- Como criador, quero ver o progresso do processamento
- Como criador, quero que o resultado seja salvo automaticamente

#### Requisitos Funcionais
- **RF-24:** Upload de imagem local (JPG, PNG, WebP)
- **RF-25:** Processamento via rembg (modelo u2net)
- **RF-26:** Exportação em PNG com canal alpha (transparência)
- **RF-27:** Progresso em tempo real via SSE
- **RF-28:** Resultado salvo em `Downloads/Videify/sem_fundo_[nome].png`
- **RF-29:** Abrir pasta automaticamente após conclusão

#### Requisitos Não Funcionais
- **RNF-14:** Processamento deve completar em até 60 segundos
- **RNF-15:** Suportar imagens até 10MB
- **RNF-16:** Tratamento de erro se Python/rembg não instalado

---

### 2.5 Discord Rich Presence

#### Descrição
Integração com Discord para mostrar atividade atual no perfil do usuário.

#### User Stories
- Como criador, quero que meus amigos vejam que estou trabalhando
- Como criador, quero mostrar automaticamente minha atividade atual

#### Requisitos Funcionais
- **RF-30:** Detectar seção atual (Ideias/Roteiros/Downloads/etc)
- **RF-31:** Atualizar status no Discord em tempo real
- **RF-32:** Marcar como "Ocioso" após 5 minutos sem atividade
- **RF-33:** Ping via `/api/presence_ping` para manter ativo
- **RF-34:** Application ID configurável

#### Requisitos Não Funcionais
- **RNF-17:** Funcionar apenas se Discord Desktop estiver rodando
- **RNF-18:** Não bloquear aplicação se Discord não disponível
- **RNF-19:** Reconectar automaticamente se Discord for reiniciado

---

### 2.6 Página Sobre

#### Descrição
Informações sobre o projeto, créditos, licença e links úteis.

#### Requisitos Funcionais
- **RF-35:** Exibir informações do projeto
- **RF-36:** Exibir licença MIT
- **RF-37:** Exibir créditos de dependências

---

## 3. Requisitos Técnicos

### 3.1 Arquitetura
- **Tipo:** Aplicação desktop monolítica
- **Frontend:** Templates Handlebars + Bootstrap 5 + Vanilla JS
- **Backend:** Node.js + Express 4.18.2
- **Desktop Framework:** Electron 30.0.0
- **Processamento:** Python 3.x + FFmpeg

### 3.2 Armazenamento
- **Tipo:** File-based (JSON)
- **Localização dados:** `%APPDATA%\Videify`
- **Localização mídias:** `%USERPROFILE%\Downloads\Videify`
- **Backup:** Não implementado (arquivos locais podem ser copiados manualmente)

### 3.3 Dependências Node.js
```json
{
  "electron": "^30.0.0",
  "express": "^4.18.2",
  "express-handlebars": "^7.0.7",
  "express-session": "^1.17.3",
  "connect-flash": "^0.1.1",
  "multer": "^2.1.1",
  "discord-rpc": "^4.0.1",
  "node-fetch": "^3.3.2"
}
```

### 3.4 Dependências Python
- pytubefix
- rembg
- Pillow

### 3.5 Plataformas Suportadas
- **Atual:** Windows x64
- **Futuro:** macOS, Linux (requer adaptações de paths e FFmpeg)

### 3.6 Requisitos de Sistema
- **OS:** Windows 7+ (64-bit)
- **RAM:** Mínimo 4GB (8GB recomendado para remoção de fundo)
- **Disco:** 500MB para aplicação + espaço para downloads
- **Python:** 3.8+ (instalado separadamente)
- **Conexão:** Apenas para download do YouTube

---

## 4. User Experience

### 4.1 Fluxo Principal

```
1. Usuário abre Videify
   ↓
2. Navega pela navbar (Ideias/Roteiros/Downloads/etc)
   ↓
3. Executa ação (criar/editar/baixar)
   ↓
4. Recebe feedback visual (flash message ou SSE progress)
   ↓
5. Dados salvos automaticamente
   ↓
6. Discord atualizado (se configurado)
```

### 4.2 Design Principles
- **Minimalismo:** Apenas o necessário na tela
- **Feedback imediato:** Toda ação tem resposta visual
- **Organização clara:** Navbar simples com 5 seções principais
- **Cores:** Bootstrap padrão com toques customizados
- **Responsividade:** Adaptável a diferentes tamanhos de janela

### 4.3 Mensagens de Erro
Todas as mensagens devem ser:
- **Claras:** Explicar o que aconteceu
- **Acionáveis:** Sugerir solução quando possível
- **Não técnicas:** Evitar stack traces para usuário final

Exemplos:
- ✅ "Erro ao baixar vídeo. Verifique se a URL está correta."
- ❌ "Error: 'NoneType' object has no attribute 'streams'"

---

## 5. Roadmap de Funcionalidades Futuras

### 5.1 Curto Prazo (1-3 meses)
- **Busca global:** Campo de busca na navbar para encontrar ideias/roteiros/downloads
- **Tags predefinidas:** Lista de tags comuns com autocomplete
- **Backup automático:** Exportar JSON para ZIP periodicamente
- **Histórico de edições:** Ver versões anteriores de roteiros
- **Preview de thumbnails:** Visualizar thumbnail em tamanho grande ao clicar

### 5.2 Médio Prazo (3-6 meses)
- **Editor de vídeo básico:** Cortar e juntar clipes simples
- **Transcrição automática:** Gerar legendas de vídeos baixados
- **Templates de roteiro:** Estruturas pré-definidas para diferentes tipos de vídeo
- **Estatísticas:** Dashboard com métricas de produtividade
- **Multi-plataforma:** Build para macOS e Linux

### 5.3 Longo Prazo (6-12 meses)
- **IA para roteiros:** Sugestões de estrutura baseadas em ideias
- **Integração com YouTube API:** Upload direto de vídeos editados
- **Colaboração local:** Compartilhar dados via rede local
- **Plugin system:** Permitir extensões da comunidade
- **Cloud sync opcional:** Backup em nuvem para quem desejar

---

## 6. Métricas de Sucesso

### 6.1 Técnicas
- **Performance:** Todas as operações < 100ms (exceto downloads/IA)
- **Estabilidade:** Zero crashes em uso normal
- **Confiabilidade:** 100% de persistência de dados salvos

### 6.2 UX
- **Tempo de aprendizado:** Usuário consegue usar todas as features em < 10 minutos
- **Taxa de erro:** < 1% de operações resultam em erro
- **Satisfação:** NPS > 8/10 (pesquisa futura)

### 6.3 Adoção
- **Downloads:** Alvo de 1000 downloads no primeiro ano
- **Retenção:** 50% dos usuários usam semanalmente após 1 mês
- **Engajamento:** Média de 10+ ideias/roteiros criados por usuário

---

## 7. Riscos e Mitigações

### 7.1 Dependência de pytubefix
**Risco:** YouTube pode mudar API e quebrar downloads  
**Mitigação:** 
- Monitorar issues do pytubefix
- Ter fallback para yt-dlp
- Avisar usuário para atualizar se quebrar

### 7.2 Tamanho da Aplicação
**Risco:** Build com Electron é pesado (~150MB)  
**Mitigação:**
- Considerar alternativas (Tauri) no futuro
- Otimizar assets incluídos
- Documentar requisitos claramente

### 7.3 Python Não Instalado
**Risco:** Usuário tenta usar downloads/remoção fundo sem Python  
**Mitigação:**
- Verificar Python na inicialização
- Exibir instruções de instalação se não encontrado
- Incluir instalador Python no futuro

### 7.4 Perda de Dados
**Risco:** Corrupção de JSON ou deleção acidental  
**Mitigação:**
- Implementar backup automático
- Validar JSON antes de salvar
- Criar snapshot antes de migração

---

## 8. Requisitos de Qualidade

### 8.1 Testes
- **Unitários:** Funções de manipulação de JSON
- **Integração:** Fluxos completos (criar → editar → deletar)
- **E2E:** Simulação de usuário completo
- **Manuais:** Testar uploads e downloads reais

### 8.2 Segurança
- **Validação de inputs:** Todos os campos validados
- **Sanitização de paths:** Evitar path traversal
- **Upload seguro:** Apenas tipos de arquivo permitidos
- **Sem exposição externa:** Servidor apenas localhost

### 8.3 Acessibilidade
- **Navegação por teclado:** Todos os elementos acessíveis
- **Labels semânticos:** Formulários com labels claros
- **Contraste:** Texto legível em todos os fundos
- **Screen readers:** Compatibilidade básica

---

## 9. Documentação

### 9.1 Para Usuários
- README.md com instruções de instalação
- Screenshots das principais features
- FAQ de problemas comuns
- Vídeo tutorial (futuro)

### 9.2 Para Desenvolvedores
- Este PRD
- Documentação de arquitetura (arquitetura.md)
- Contexto atual (contexto-atual.md)
- Comentários inline em código complexo

---

## 10. Suporte e Manutenção

### 10.1 Canais de Suporte
- GitHub Issues (bugs e feature requests)
- Discord community (futuro)
- Email direto ao desenvolvedor

### 10.2 Atualizações
- **Patch (1.0.x):** Bug fixes críticos
- **Minor (1.x.0):** Novas features não-breaking
- **Major (x.0.0):** Mudanças de arquitetura ou breaking changes

### 10.3 Ciclo de Vida
- **Suporte ativo:** Versão atual + 1 anterior
- **Segurança:** Patches críticos para 2 versões anteriores
- **EOL:** Avisar usuários com 3 meses de antecedência

---

## 11. Aprovações

| Papel | Nome | Data | Status |
|-------|------|------|--------|
| Product Owner | - | 30/07/2026 | ✅ Aprovado |
| Tech Lead | - | 30/07/2026 | ✅ Aprovado |
| UX Designer | - | 30/07/2026 | ✅ Aprovado |

---

**Última atualização:** 30/07/2026  
**Próxima revisão:** 30/10/2026
