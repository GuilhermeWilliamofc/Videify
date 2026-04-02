// ===================================================
// Videify — Global: Theme & Language
// ===================================================

const TRANSLATIONS = {
  pt: {
    nav_home:      'Início',
    nav_ideas:     'Ideias',
    nav_scripts:   'Roteiros',
    nav_downloads: 'Downloads',
    nav_about:     'Sobre',
    lang_btn:      '🌐 EN',
    theme_dark:    '🌙',
    theme_light:   '☀️',
  },
  en: {
    nav_home:      'Home',
    nav_ideas:     'Ideas',
    nav_scripts:   'Scripts',
    nav_downloads: 'Downloads',
    nav_about:     'About',
    lang_btn:      '🌐 PT',
    theme_dark:    '🌙',
    theme_light:   '☀️',
  }
};

// ---- Theme --------------------------------------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vfy_theme', theme);
  const btn = document.getElementById('vfy-theme-btn');
  if (!btn) return;
  const t = TRANSLATIONS[getCurrentLang()];
  btn.textContent = theme === 'dark' ? t.theme_light : t.theme_dark;
  btn.title = theme === 'dark' ? 'Modo claro / Light mode' : 'Modo escuro / Dark mode';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ---- Language -----------------------------------------------------
function getCurrentLang() {
  return localStorage.getItem('vfy_lang') || 'pt';
}

function applyLang(lang) {
  localStorage.setItem('vfy_lang', lang);
  const t = TRANSLATIONS[lang];

  const map = {
    'vfy-nav-home':      t.nav_home,
    'vfy-nav-ideas':     t.nav_ideas,
    'vfy-nav-scripts':   t.nav_scripts,
    'vfy-nav-downloads': t.nav_downloads,
    'vfy-nav-about':     t.nav_about,
  };

  Object.entries(map).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) {
      // keep the icon span if present
      const icon = el.querySelector('.material-icons');
      el.textContent = '';
      if (icon) el.appendChild(icon);
      el.appendChild(document.createTextNode(text));
    }
  });

  const langBtn = document.getElementById('vfy-lang-btn');
  if (langBtn) langBtn.textContent = t.lang_btn;

  // Update data-form translations if the elements exist
  applyFormLang(lang);

  // Re-sync theme button label in new language
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const themeBtn = document.getElementById('vfy-theme-btn');
  if (themeBtn) {
    themeBtn.textContent = theme === 'dark' ? t.theme_light : t.theme_dark;
  }
}

function toggleLang() {
  const current = getCurrentLang();
  applyLang(current === 'pt' ? 'en' : 'pt');
}

// ---- Form translations (pages with data-i18n attributes) ----------
const FORM_TRANSLATIONS = {
  pt: {
    // common
    'card-btn-edit':    '✎ Editar',
    'card-btn-delete':  '✕ Excluir',
    'card-btn-expand':  '▼ Ver mais',
    'card-btn-collapse':'▲ Ver menos',
    'badge-concept':    'Conceito / Inicial',
    'badge-prod':       'Em Produção',
    'badge-done':       'Concluído / Postado',
    'confirm-delete-idea': 'Tem certeza que deseja excluir esta ideia?',
    'confirm-delete-script': 'Tem certeza que deseja excluir este roteiro?',
    
    // home page
    'home-title':       'Bem-vindo ao Videify!',
    'home-subtitle':    'O que deseja fazer hoje?',
    'home-section-script': '📝 Criar Novo Roteiro',
    'home-desc-script':  'Dê forma à sua ideia com uma estrutura completa de roteiro. Perfeito para planejar vídeos com começo, meio e fim.',
    'home-btn-script':   '+ Criar Novo Roteiro',
    'home-section-idea': '💡 Salve uma Ideia',
    'home-desc-idea':    'Anote aquela inspiração rápida antes que ela fuja.',
    'home-btn-idea':     '+ Nova Ideia',
    'home-section-dl':   '📥 Baixar Vídeo/Imagem',
    'home-desc-dl':      'Cole um link de imagem ou vídeo e salve para seus projetos. Baixe conteúdo livre de direitos autorais que você pode usar com segurança.',
    'home-btn-dl':       '+ Importar Link',

    // idea form
    'idea-title':       'Nova Ideia',
    'idea-subtitle':    'Nenhuma ideia ainda? Comece salvando qualquer inspiração. Pode ser uma frase, um tema ou só um título.',
    'idea-label-name':  'Nome da ideia:',
    'idea-ph-name':     'Minha Ideia...',
    'idea-label-desc':  'Descrição da ideia:',
    'idea-ph-desc':     'Descrição da sua ideia...',
    'idea-label-tag':   'Tags:',
    'idea-ph-tag':      'Palavras-chave separadas por vírgula (ex: tutorial, humor, vlog)...',
    'idea-btn-submit':  'Enviar',
    'idea-btn-cancel':  'Cancelar',

    // script form
    'script-title':         'Novo Roteiro',
    'script-subtitle':      'Nenhum roteiro ainda? Comece transformando uma ideia em roteiro.',
    'script-label-title2':  'Título do Vídeo:',
    'script-ph-title2':     'Nome do vídeo/roteiro...',
    'script-label-stage':   'Fase de Produção:',
    'script-opt-concept':   '🔴 Conceito / Inicial',
    'script-opt-prod':      '🟡 Em Produção',
    'script-opt-done':      '🟢 Concluído / Postado',
    'script-label-thumb':   'Thumbnail do Vídeo (Opcional):',
    'script-small-thumb':   'Envie um arquivo do seu computador.',
    'script-label-file':    'Arquivo:',
    'script-label-desc':    'Descrição/Resumo:',
    'script-ph-desc':       'Breve explicação sobre o vídeo...',
    'script-h2-struct':     'Estrutura do Roteiro',
    'script-p-struct':      'Dividida em Introdução, Desenvolvimento e Conclusão',
    'script-label-intro':   'Introdução:',
    'script-ph-intro':      'Como começa o vídeo?',
    'script-label-dev':     'Desenvolvimento:',
    'script-ph-dev':        'O que você quer ensinar, mostrar ou fazer nesse vídeo?',
    'script-label-concl':   'Conclusão:',
    'script-ph-concl':      'Frase de despedida, convite para o próximo vídeo, agradecimento, etc.',
    'script-btn-submit':    'Enviar',
    'script-btn-cancel':    'Cancelar',
    'btn-copy':             'Copiar',

    // download form
    'dl-title':         'Baixar Vídeo/Imagem',
    'dl-label-type':    'Tipo de Link:',
    'dl-opt-choose':    '--- Escolha ---',
    'dl-opt-yt':        'Vídeo Youtube',
    'dl-opt-img':       'Imagem',
    'dl-label-fmt':     'Formato (Youtube):',
    'dl-opt-video':     'Vídeo Completo (MP4)',
    'dl-opt-mp3':       'Somente Áudio (MP3)',
    'dl-opt-opus':      'Somente Áudio (OPUS)',
    'dl-label-link':    'Link:',
    'dl-ph-link':       'Cole seu link aqui...',
    'dl-btn-download':  'Baixar',
    'dl-btn-clear':     'Limpar',
    'dl-btn-cancel':    'Cancelar',

    // ideas list page
    'page-ideas-title':     'Minhas Ideias 💡',
    'page-ideas-subtitle':  'Anote aquela inspiração rápida antes que ela fuja.',
    'page-ideas-btn':       '+ Nova Ideia',
    'page-ideas-empty':     'Nenhuma ideia encontrada. Adicione uma nova!',

    // scripts list page
    'page-scripts-title':    'Meus Roteiros 📝',
    'page-scripts-subtitle': 'Dê forma à sua ideia com uma estrutura completa de roteiro. Perfeito para planejar vídeos com começo, meio e fim.',
    'page-scripts-btn':      '+ Novo Roteiro',
    'page-scripts-empty':    'Nenhum roteiro encontrado. Adicione um novo!',
    'card-read-time':       'Leitura:',
    'card-summary':         'Resumo:',
    'card-intro':           'Introdução:',
    'card-dev':             'Desenvolvimento:',
    'card-concl':           'Conclusão:',

    // downloads page
    'page-downloads-title':  'Meus Downloads 📥',
    'page-downloads-subtitle':'Seus arquivos baixados localmente.',
    'page-downloads-btn':    '+ Novo Download',
    'page-downloads-empty':  'Você ainda não tem nenhum arquivo baixado pelo Videify.',
    'no-cover':             'Sem Capa',
    'badge-img':            'Imagem',
    'badge-yt-video':       'Vídeo Youtube',
    'badge-yt-mp3':         'Áudio MP3',
    'badge-yt-opus':        'Áudio OPUS',
    'dl-date-label':        'Baixado em:',
    'btn-view-img':         'Visualizar Imagem',
    'btn-view-video':       'Vídeo Completo',
    'btn-view-mp3':         'Arquivo .MP3',
    'btn-view-opus':        'Arquivo .OPUS',
    'btn-open-folder':      '📂 Abrir Local',

    // about page
    'about-title':          'Sobre',
    'about-desc':           'É uma aplicação pessoal feita para quem cria vídeos para redes sociais. Aqui você pode organizar roteiros, salvar ideias, baixar vídeos e imagens tudo em um só lugar, de forma prática.',
    'about-author-title':   'Quem Fez?',
    'about-author-desc':    'Este projeto foi desenvolvido por Guilherme William, com o objetivo de ajudar criadores a manterem seu conteúdo organizado e acessível.',
  },
  en: {
    // common
    'card-btn-edit':    '✎ Edit',
    'card-btn-delete':  '✕ Delete',
    'card-btn-expand':  '▼ Show more',
    'card-btn-collapse':'▲ Show less',
    'badge-concept':    'Concept / Initial',
    'badge-prod':       'In Production',
    'badge-done':       'Completed / Posted',
    'confirm-delete-idea': 'Are you sure you want to delete this idea?',
    'confirm-delete-script': 'Are you sure you want to delete this script?',

    // home page
    'home-title':       'Welcome to Videify!',
    'home-subtitle':    'What do you want to do today?',
    'home-section-script': '📝 Create New Script',
    'home-desc-script':  'Give shape to your idea with a complete script structure. Perfect for planning videos with a beginning, middle, and end.',
    'home-btn-script':   '+ Create New Script',
    'home-section-idea': '💡 Save an Idea',
    'home-desc-idea':    'Write down that quick inspiration before it gets away.',
    'home-btn-idea':     '+ New Idea',
    'home-section-dl':   '📥 Download Video/Image',
    'home-desc-dl':      'Paste an image or video link and save it for your projects. Download copyright-free content that you can use safely.',
    'home-btn-dl':       '+ Import Link',

    // idea form
    'idea-title':       'New Idea',
    'idea-subtitle':    'No ideas yet? Start by saving any inspiration — a phrase, a theme, or just a title.',
    'idea-label-name':  'Idea name:',
    'idea-ph-name':     'My Idea...',
    'idea-label-desc':  'Idea description:',
    'idea-ph-desc':     'Description of your idea...',
    'idea-label-tag':   'Tags:',
    'idea-ph-tag':      'Keywords separated by comma (e.g.: tutorial, humor, vlog)...',
    'idea-btn-submit':  'Submit',
    'idea-btn-cancel':  'Cancel',

    // script form
    'script-title':         'New Script',
    'script-subtitle':      'No scripts yet? Start by turning an idea into a script.',
    'script-label-title2':  'Video Title:',
    'script-ph-title2':     'Video/script name...',
    'script-label-stage':   'Production Stage:',
    'script-opt-concept':   '🔴 Concept / Draft',
    'script-opt-prod':      '🟡 In Production',
    'script-opt-done':      '🟢 Completed / Posted',
    'script-label-thumb':   'Video Thumbnail (Optional):',
    'script-small-thumb':   'Upload a file from your computer.',
    'script-label-file':    'File:',
    'script-label-desc':    'Description/Summary:',
    'script-ph-desc':       'Brief explanation of the video...',
    'script-h2-struct':     'Script Structure',
    'script-p-struct':      'Divided into Introduction, Development and Conclusion',
    'script-label-intro':   'Introduction:',
    'script-ph-intro':      'How does the video start?',
    'script-label-dev':     'Development:',
    'script-ph-dev':        'What do you want to teach, show or do in this video?',
    'script-label-concl':   'Conclusion:',
    'script-ph-concl':      'Farewell phrase, invitation to the next video, thanks, etc.',
    'script-btn-submit':    'Submit',
    'script-btn-cancel':    'Cancel',
    'btn-copy':             'Copy',

    // download form
    'dl-title':         'Download Video/Image',
    'dl-label-type':    'Link Type:',
    'dl-opt-choose':    '--- Choose ---',
    'dl-opt-yt':        'YouTube Video',
    'dl-opt-img':       'Image',
    'dl-label-fmt':     'Format (YouTube):',
    'dl-opt-video':     'Full Video (MP4)',
    'dl-opt-mp3':       'Audio Only (MP3)',
    'dl-opt-opus':      'Audio Only (OPUS)',
    'dl-label-link':    'Link:',
    'dl-ph-link':       'Paste your link here...',
    'dl-btn-download':  'Download',
    'dl-btn-clear':     'Clear',
    'dl-btn-cancel':    'Cancel',

    // ideas list page
    'page-ideas-title':     'My Ideas 💡',
    'page-ideas-subtitle':  'Write down that quick inspiration before it gets away.',
    'page-ideas-btn':       '+ New Idea',
    'page-ideas-empty':     'No ideas found. Add a new one!',

    // scripts list page
    'page-scripts-title':    'My Scripts 📝',
    'page-scripts-subtitle': 'Give shape to your idea with a complete script structure. Perfect for planning videos with a beginning, middle, and end.',
    'page-scripts-btn':      '+ New Script',
    'page-scripts-empty':    'No scripts found. Add a new one!',
    'card-read-time':       'Reading:',
    'card-summary':         'Summary:',
    'card-intro':           'Introduction:',
    'card-dev':             'Development:',
    'card-concl':           'Conclusion:',

    // downloads page
    'page-downloads-title':  'My Downloads 📥',
    'page-downloads-subtitle':'Your locally downloaded files.',
    'page-downloads-btn':    '+ New Download',
    'page-downloads-empty':  'You don\'t have any files downloaded by Videify yet.',
    'no-cover':             'No Cover',
    'badge-img':            'Image',
    'badge-yt-video':       'YouTube Video',
    'badge-yt-mp3':         'Audio MP3',
    'badge-yt-opus':        'Audio OPUS',
    'dl-date-label':        'Downloaded on:',
    'btn-view-img':         'View Image',
    'btn-view-video':       'Complete Video',
    'btn-view-mp3':         'File .MP3',
    'btn-view-opus':        'File .OPUS',
    'btn-open-folder':      '📂 Open Folder',

    // about page
    'about-title':          'About',
    'about-desc':           'It is a personal application made for those who create videos for social networks. Here you can organize scripts, save ideas, download videos and images all in one place, in a practical way.',
    'about-author-title':   'Who Made It?',
    'about-author-desc':    'This project was developed by Guilherme William, with the aim of helping creators keep their content organized and accessible.',
  }
};

function applyFormLang(lang) {
  const t = FORM_TRANSLATIONS[lang];
  if (!t) return;

  // Global variables for JS alerts
  window.VFY_CONFIRM_DELETE = t['confirm-delete-idea'];
  window.VFY_CONFIRM_DELETE_SCRIPT = t['confirm-delete-script'];
  window.VFY_EXPAND = t['card-btn-expand'].replace('▼ ', '');
  window.VFY_COLLAPSE = t['card-btn-collapse'].replace('▲ ', '');

  // Text content updates (elements with data-i18n attribute)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // Placeholder updates (elements with data-i18n-ph attribute)
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (t[key] !== undefined) {
      el.placeholder = t[key];
    }
  });

  // Value updates for buttons/inputs (elements with data-i18n-val attribute)
  document.querySelectorAll('[data-i18n-val]').forEach(el => {
    const key = el.getAttribute('data-i18n-val');
    if (t[key] !== undefined) {
      el.value = t[key];
    }
  });
}

// ---- Init on DOM ready --------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('vfy_theme') || 'light';
  const savedLang  = getCurrentLang();

  applyTheme(savedTheme);
  applyLang(savedLang);
});

// ---- Utility functions --------------------------------------------
window.vfyTogglePreview = function(btn) {
    const card = btn.closest('.card-body');
    const previews = card.querySelectorAll('.vfy-preview-text');
    const isCollapsed = previews[0].style.webkitLineClamp !== 'unset' && previews[0].style.webkitLineClamp !== '';
    const expandLabel = window.VFY_EXPAND || 'Ver mais';
    const collapseLabel = window.VFY_COLLAPSE || 'Ver menos';
    if (isCollapsed) {
        previews.forEach(s => { s.style.webkitLineClamp = 'unset'; s.style.display = 'block'; });
        btn.innerHTML = '▲ <span>' + collapseLabel + '</span>';
    } else {
        const limits = [4, 4, 3];
        previews.forEach((s, i) => { s.style.webkitLineClamp = limits[i] || 4; s.style.display = '-webkit-box'; });
        btn.innerHTML = '▼ <span>' + expandLabel + '</span>';
    }
}

window.openFolder = function(filePath) {
    if (!filePath) return;
    fetch('/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
    })
    .then(res => {
        if (!res.ok) alert('Não foi possível localizar o arquivo no computador.');
    })
    .catch(err => {
        console.error('Erro ao abrir pasta:', err);
        alert('Erro ao tentar abrir a pasta.');
    });
};

window.vfyCopyText = function(id) {
    const el = document.getElementById(id);
    if (!el) return;

    let textToCopy = "";
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        textToCopy = el.value;
    } else {
        textToCopy = el.innerText;
    }

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.querySelector(`button[onclick*="vfyCopyText('${id}')"]`);
        if (btn) {
            const originalHTML = btn.innerHTML;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            btn.innerHTML = '<span class="material-icons" style="font-size: 18px;">check</span>';
            btn.classList.add('vfy-copy-success');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('vfy-copy-success');
            }, 1500);
        }
    }).catch(err => {
        console.error('Erro ao copiar texto:', err);
    });
};

