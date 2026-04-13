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
    nav_bg:        'Remover Fundo',
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
    nav_bg:        'Remove Background',
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
    'vfy-nav-bg':        t.nav_bg,
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
    
    // toast notifications
    'toast-autosave':       'Salvo automaticamente às {time}',
    'toast-undo':           'Ação desfeita',
    'toast-redo':           'Ação refeita',
    'status-unsaved':       '⚠️ Mudanças não salvas...',
    'status-saved':         '✔️ Salvo',
    'script-warning-autosave': '⚠️ <strong>Primeiro Roteiro?</strong> Salve manualmente ao menos uma vez (botão Enviar). O salvamento automático apenas previne perda de dados temporária.',
    
    // Background removal
    'bg-title':             'Remover Fundo de Imagem',
    'bg-subtitle':          'Remova fundos rapidamente com inteligência artificial, sem enviar para a internet.',
    'bg-label-file':        '1. Selecione a imagem:',
    'bg-preview-label':     'Visualização:',
    'bg-btn-submit':        'Remover Fundo',
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

    // toast notifications
    'toast-autosave':       'Automatically saved at {time}',
    'toast-undo':           'Action undone',
    'toast-redo':           'Action redone',
    'status-unsaved':       '⚠️ Unsaved changes...',
    'status-saved':         '✔️ Saved',
    'script-warning-autosave': '⚠️ <strong>New Script?</strong> Save manually at least once (Submit button). Autosave only prevents temporary data loss.',

    // Background removal
    'bg-title':             'Remove Image Background',
    'bg-subtitle':          'Remove backgrounds quickly with artificial intelligence, without uploading to the internet.',
    'bg-label-file':        '1. Select the image:',
    'bg-preview-label':     'Preview:',
    'bg-btn-submit':        'Remove Background',
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

  // Html content updates (elements with data-i18n attribute)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
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

  // Inicializa os novos recursos
  initAutoSave();
  initUndoRedoNotifications();
  initWordCounter();
  initDiscordHeartbeat();
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

// ===================================================
// Videify — Autosave, Undo/Redo & Word Counter
// ===================================================

function showToast(message) {
    let toastContainer = document.getElementById('vfy-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'vfy-toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '10px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toast.style.background = isDark ? '#2e2e2e' : '#fff';
    toast.style.color = isDark ? '#fff' : '#333';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.borderLeft = '4px solid #ff8e99';
    toast.style.fontSize = '0.9em';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }, 3000);
}

function initAutoSave() {
    const isFormPage = window.location.pathname.startsWith('/nova_ideia') || 
                       window.location.pathname.startsWith('/editar_ideia') ||
                       window.location.pathname.startsWith('/novo_roteiro') ||
                       window.location.pathname.startsWith('/editar_roteiro');

    if (!isFormPage) return;

    const form = document.querySelector('form');
    if (!form) return;

    const storageKey = 'vfy_autosave_' + window.location.pathname;

    let statusPopup = null;

    const lang = getCurrentLang();
    const t = FORM_TRANSLATIONS[lang] || FORM_TRANSLATIONS['pt'];
    const txtUnsaved = t['status-unsaved'] || '⚠️ Mudanças não salvas...';
    const txtSaved = t['status-saved'] || '✔️ Salvo';

    function updateStatus(state) {
        if (!statusPopup) {
            statusPopup = document.createElement('div');
            statusPopup.id = 'vfy-persistent-toast';
            statusPopup.style.position = 'fixed';
            statusPopup.style.bottom = '80px';
            statusPopup.style.right = '20px';
            statusPopup.style.padding = '10px 20px';
            statusPopup.style.borderRadius = '8px';
            statusPopup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            statusPopup.style.fontSize = '1em';
            statusPopup.style.fontWeight = 'bold';
            statusPopup.style.transition = 'all 0.3s ease';
            statusPopup.style.zIndex = '9998';
            statusPopup.style.opacity = '0';
            statusPopup.style.transform = 'translateY(20px)';
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            statusPopup.style.background = isDark ? '#2e2e2e' : '#fff';
            statusPopup.style.color = isDark ? '#fff' : '#333';
            document.body.appendChild(statusPopup);
        }

        if (state === 'unsaved') {
            const btnText = lang === 'en' ? 'Save' : 'Salvar';
            statusPopup.innerHTML = `<span>${txtUnsaved}</span> <button id="vfy-force-save-btn" style="margin-left: 15px; padding: 4px 12px; border-radius: 6px; background: #ff8e99; color: #2e2e2e; cursor: pointer; border: none; font-size: 0.85em; font-weight: bold;">${btnText}</button>`;
            statusPopup.style.borderLeft = '4px solid #ff8e99';
            
            setTimeout(() => {
                const btn = document.getElementById('vfy-force-save-btn');
                if (btn) btn.addEventListener('click', triggerSave);
            }, 0);

            // Trigger animation immediately
            setTimeout(() => {
                statusPopup.style.opacity = '1';
                statusPopup.style.transform = 'translateY(0)';
            }, 10);
        } else if (state === 'saved') {
            statusPopup.textContent = txtSaved;
            statusPopup.style.borderLeft = '4px solid #28a745';
            statusPopup.style.opacity = '1';
            statusPopup.style.transform = 'translateY(0)';
            
            // Fades out after 3 seconds
            setTimeout(() => {
                if (statusPopup.textContent === txtSaved) {
                    statusPopup.style.opacity = '0';
                    statusPopup.style.transform = 'translateY(20px)';
                }
            }, 3000);
        }
    }

    // Load draft if exists
    const draft = localStorage.getItem(storageKey);
    let loadedDraft = false;
    if (draft) {
        try {
            const data = JSON.parse(draft);
            for (const [name, value] of Object.entries(data)) {
                const input = form.elements.namedItem(name);
                if (input && name !== 'thumbnail_file') {
                    input.value = value;
                }
            }
            loadedDraft = true;
        } catch(e) {}
    }

    let saveTimeout;

    function triggerSave() {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                data[key] = value;
            }
        }
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        const lang = getCurrentLang();
        const t = FORM_TRANSLATIONS[lang] || FORM_TRANSLATIONS['pt'];
        const timeStr = new Date().toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        let msg = t['toast-autosave'] || 'Salvo automaticamente às {time}';
        msg = msg.replace('{time}', timeStr);
        showToast(msg);
        updateStatus('saved');
    }

    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdKey = isMac ? e.metaKey : e.ctrlKey;
        if (cmdKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            triggerSave();
        }
    });

    if (loadedDraft) {
        updateStatus('unsaved');
    }

    function onInputTrigger(e) {
        if (e.target.type === 'file') return;
        updateStatus('unsaved');
        
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            triggerSave();
        }, 800); // reduced from 1500 to 800ms
    }

    function onBlurTrigger(e) {
        if (e.target.type === 'file') return;
        clearTimeout(saveTimeout);
        if (statusPopup && statusPopup.textContent.includes(txtUnsaved)) {
            triggerSave();
        }
    }

    form.addEventListener('input', onInputTrigger);
    form.addEventListener('change', onBlurTrigger);
    form.addEventListener('focusout', onBlurTrigger);

    form.addEventListener('submit', () => {
        localStorage.removeItem(storageKey);
    });
}

function initUndoRedoNotifications() {
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdKey = isMac ? e.metaKey : e.ctrlKey;
        
        // Verifica se o foco esta num input ou textarea
        const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isInput) return;

        if (cmdKey && e.key.toLowerCase() === 'z') {
            if (e.shiftKey) {
                // Redo
                requestAnimationFrame(() => {
                    const lang = getCurrentLang();
                    const t = FORM_TRANSLATIONS[lang] || FORM_TRANSLATIONS['pt'];
                    showToast(t['toast-redo'] || 'Ação refeita');
                });
            } else {
                // Undo
                requestAnimationFrame(() => {
                    const lang = getCurrentLang();
                    const t = FORM_TRANSLATIONS[lang] || FORM_TRANSLATIONS['pt'];
                    showToast(t['toast-undo'] || 'Ação desfeita');
                });
            }
        } else if (cmdKey && e.key.toLowerCase() === 'y') {
            // Redo
            requestAnimationFrame(() => {
                const lang = getCurrentLang();
                const t = FORM_TRANSLATIONS[lang] || FORM_TRANSLATIONS['pt'];
                showToast(t['toast-redo'] || 'Ação refeita');
            });
        }
    });
}

function initWordCounter() {
    const wordsEl = document.getElementById('vfy-words');
    const pagesEl = document.getElementById('vfy-pages');
    if (!wordsEl || !pagesEl) return;

    // Count from specific textareas usually used in script
    const textareas = [
        document.getElementById('iintroducao'),
        document.getElementById('idesenvolvimento'),
        document.getElementById('iconclusao'),
        document.getElementById('idescricao')
    ];

    function updateCounter() {
        let text = '';
        textareas.forEach(ta => {
            if (ta && ta.value) {
                text += ta.value + ' ';
            }
        });

        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const pages = (words / 250).toFixed(1);

        wordsEl.textContent = words;
        pagesEl.textContent = pages > 0 ? pages : '0';
    }

    textareas.forEach(ta => {
        if (ta) ta.addEventListener('input', updateCounter);
    });

    // Initial update
    updateCounter();
}

// ==== Discord Presence Heartbeat ====
function initDiscordHeartbeat() {
    let lastPing = 0;
    const pingDelay = 60000; // 1 minuto entre pings
    
    function ping() {
        const now = Date.now();
        if (now - lastPing > pingDelay) {
            lastPing = now;
            fetch('/api/presence_ping', { method: 'POST', body: '{}' }).catch(err => {
                // silencioso
            });
        }
    }
    
    // Ping inicial ao carregar a página
    ping();
    
    // Pings com base na atividade do usuário
    document.addEventListener('mousemove', ping, { passive: true });
    document.addEventListener('keydown', ping, { passive: true });
    document.addEventListener('click', ping, { passive: true });
}

