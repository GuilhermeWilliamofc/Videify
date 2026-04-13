const DiscordRPC = require('discord-rpc');

/**
 * --- INSTRUÇÕES PARA PERSONALIZAR O DISCORD ---
 * 1. Acesse: https://discord.com/developers/applications
 * 2. Crie um "New Application" com o nome "Videify"
 * 3. Em "Rich Presence" -> "App Assets", envie sua logo e dê o nome de 'logo_videify'
 * 4. Copie o "CLIENT ID" da aba "General Information" e cole abaixo.
 */
const clientId = '1493040533092958308'; // Substitua pelo seu Client ID para mudar o nome de "Visual Studio Code" para "Videify"

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
let startTimestamp = new Date();
let rpcReady = false;
let currentStatus = 'Página Inicial';
let idleTimeout = null;

async function setActivity(statusText = null) {
  if (statusText) {
    currentStatus = statusText;
  }
  
  if (!rpcReady) return;

  try {
    rpc.setActivity({
      details: 'Videify',
      state: statusText || currentStatus,
      startTimestamp,
      largeImageKey: 'logo_videify', // Deve ser o mesmo nome que você colocou no Developer Portal
      largeImageText: 'Videify - Content Planner',
      instance: false,
    });
  } catch (err) {
    console.error('Failed to set Discord Activity:', err);
  }

  // Reseta o timer de ociosidade
  if ((statusText || currentStatus) !== 'Ocioso') {
    resetIdleTimer();
  }
}

function resetIdleTimer() {
  clearTimeout(idleTimeout);
  // Ociosidade detectada após 5 minutos sem ping
  idleTimeout = setTimeout(() => {
    if (rpcReady) {
      rpc.setActivity({
        details: 'Videify',
        state: 'Ocioso',
        startTimestamp,
        largeImageKey: 'logo_videify',
        largeImageText: 'Videify - Content Planner',
        instance: false,
      });
    }
  }, 5 * 60 * 1000);
}

function pingPresence() {
  // Chamado pelo frontend indica que o usuário obrou atividade
  // Retorna para o status anterior (ex: se estava ocioso, volta para a página X)
  setActivity(currentStatus);
}

function initDiscord() {
  rpc.on('ready', () => {
    console.log('Discord Rich Presence Connected!');
    rpcReady = true;
    setActivity(currentStatus);
  });

  rpc.login({ clientId }).catch(err => {
    console.log('Discord RPC Warning: Could not connect to Discord (is it running?)');
  });
}

module.exports = { initDiscord, setActivity, pingPresence };
