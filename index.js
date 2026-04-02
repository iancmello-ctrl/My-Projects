const { spawn } = require('child_process');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const fs = require('fs');
const chalk = require('chalk').default;
const axios = require('axios');
const favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'favicon.ico')));

const app = express();
const PORT = 3000;

app.get('/status', (req, res) => {
  res.send('Servidor de jogo rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor de jogo iniciado na porta ${PORT}`);
});
// Rota simples
app.get('/status', (req, res) => {
  res.send('Servidor protegido e rodando!');
});

// Inicializa painel e servidor
app.listen(PORT, () => {
  console.log(chalk.yellow.bold(`Painel seguro rodando na porta ${PORT}`));
  startGameServer();

  // Alerta inicial de sucesso ✅
  sendTelegramAlert(`✅ [Servidor Jogos] iniciado com sucesso em ${formatDate()}`);
});


// Configuração do Telegram
const TELEGRAM_TOKEN = 'Your Token';
const TELEGRAM_CHAT_ID = 'You chat id';

function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message })
    .then(() => console.log(chalk.cyan('Alerta enviado ao Telegram!')))
    .catch(err => console.error(chalk.red('Erro ao enviar alerta:', err)));
}

// Garante que os arquivos de log existem
fs.writeFileSync('./error.log', '', { encoding: 'utf8' });
fs.writeFileSync('./status.log', '', { encoding: 'utf8' });
fs.writeFileSync('./server.log', '', { encoding: 'utf8' });

// Função para formatar data/hora
function formatDate() {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const ano = now.getFullYear();
  const hora = String(now.getHours()).padStart(2, '0');
  const minuto = String(now.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// Middleware de segurança
app.use(helmet());

// Limite de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Muitas requisições detectadas. Tente mais tarde.'
});
app.use(limiter);

// Middleware para validar entradas
app.use(express.json());
app.post('/validate', (req, res) => {
  const { email } = req.body;
  if (!validator.isEmail(email)) {
    return res.status(400).send('Email inválido!');
  }
  res.send('Email válido!');
});

// Função para iniciar o servidor de jogo
function startGameServer() {
  const server = spawn('node', ['gameServer.js']);

  server.stdout.on('data', data => {
    console.log(chalk.blue.italic(`Servidor: ${data}`));
  });

  server.stderr.on('data', data => {
    console.error(chalk.red.bgWhite.bold(`Erro: ${data}`));
    const logError = `[${formatDate()}] ERRO: ${data.toString()}\n`;
    fs.appendFileSync('./error.log', logError, { encoding: 'utf8' });
    fs.appendFileSync('./server.log', logError, { encoding: 'utf8' });

    // Alerta de erro crítico ❌
    sendTelegramAlert(`❌ [Servidor Jogos] ERRO CRÍTICO: ${data.toString()} em ${formatDate()}`);
  });

  server.on('close', code => {
    const logMessage = `[${formatDate()}] STATUS: Servidor caiu com código ${code}\n`;
    fs.appendFileSync('./status.log', logMessage, { encoding: 'utf8' });
    fs.appendFileSync('./server.log', logMessage, { encoding: 'utf8' });
    console.log(chalk.green.bgBlack.bold(logMessage));

    // Alerta de falha ❌
    sendTelegramAlert(`❌ [Servidor Jogos] caiu com código ${code} em ${formatDate()}`);

    // Reinicia automaticamente
    startGameServer();

    // Alerta de sucesso ✅ (reinício)
    sendTelegramAlert(`✅ [Servidor Jogos] reiniciado com sucesso em ${formatDate()}`);
  });
}

