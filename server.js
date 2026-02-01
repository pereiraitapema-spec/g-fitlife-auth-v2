
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de Segurança e Logs
app.use(helmet({
  contentSecurityPolicy: false // Permitir carregamento de recursos externos do Studio
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rota de Health Check (Obrigatório para Railway/Cloud)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Mock de rotas de autenticação (Serão consumidas pelo Supabase Client no frontend)
app.post('/api/auth/register', (req, res) => {
  res.status(200).json({ message: 'Redirect to Supabase Auth Handler' });
});

app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ message: 'Session management via JWT Supabase' });
});

// Inicialização
app.listen(PORT, () => {
  console.log(`
  ===========================================
  🚀 G-FITLIFE BACKEND ONLINE
  📡 Porta: ${PORT}
  🔗 Status: http://localhost:${PORT}/health
  ===========================================
  `);
});
