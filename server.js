const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares de Segurança e Monitoramento
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 2. Rotas de API
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    system: 'G-FitLife Enterprise',
    timestamp: new Date().toISOString() 
  });
});

// Simulação de Auditoria de Login no Backend
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  console.log(`[AUTH] Tentativa de login: ${email} em ${new Date().toISOString()}`);
  // No fluxo real, aqui validaríamos tokens ou faríamos chamadas Admin do Supabase
  res.status(200).json({ status: 'audited', message: 'Login processado pelo gateway' });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name } = req.body;
  console.log(`[AUTH] Novo registro solicitado: ${name} (${email})`);
  res.status(201).json({ status: 'audited', message: 'Registro em processamento' });
});

// 3. Servir Arquivos Estáticos do Frontend
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Roteamento Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 5. Inicialização
app.listen(PORT, () => {
  console.log(`
  =================================================
  🚀 G-FITLIFE ENTERPRISE SERVER ONLINE
  📡 Porta: ${PORT}
  🌍 Ambiente: ${process.env.NODE_ENV || 'production'}
  =================================================
  `);
});