console.log("Servidor de jogo iniciado...");

// Simula funcionamento normal por alguns segundos
setTimeout(() => {
  // Força um erro proposital
  throw new Error("Falha simulada no servidor de jogo!");
}, 5000);

// Mantém o servidor imprimindo mensagens enquanto não cai
setInterval(() => {
  console.log("Servidor de jogo rodando normalmente...");
}, 2000);
