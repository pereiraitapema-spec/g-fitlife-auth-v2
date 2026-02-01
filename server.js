
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
  contentSecurityPolicy: false, // Necessário para permitir recursos externos do Studio/Gemini
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 2. Rotas de API (Sempre antes dos arquivos estáticos)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    system: 'G-FitLife Enterprise',
    timestamp: new Date().toISOString() 
  });
});

// 3. Servir Arquivos Estáticos do Frontend (React/Vite build)
// O Vite gera por padrão na pasta 'dist' na raiz do projeto
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Roteamento Catch-all para Single Page Application (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 5. Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`
  =================================================
  🚀 G-FITLIFE SERVER ONLINE
  📡 Porta: ${PORT}
  🌍 Ambiente: ${process.env.NODE_ENV || 'development'}
  📂 Servindo Frontend de: ${path.join(__dirname, 'dist')}
  =================================================
  `);
});
