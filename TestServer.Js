const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(`Erro: ${error.message}`);
});

req.end();
 
// para rodar: node testServer.js

// Se o servidor estiver ativo, você verá algo como:

// Código
// Status: 200
// Servidor rodando com sucesso!