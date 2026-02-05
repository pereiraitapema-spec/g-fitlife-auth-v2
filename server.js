const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { supabaseAdmin } = require('./backend/supabaseAdmin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Seed Master com Verificação de Duplicidade
async function seedMasterUser() {
  try {
    const email = (process.env.MASTER_EMAIL || 'admin@system.local').toLowerCase();
    const password = process.env.MASTER_PASSWORD || 'admin123';

    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = usersData.users.find(u => u.email.toLowerCase() === email);

    if (!targetUser) {
      console.log('[CORE-SEED] Criando Master account...');
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin_master' }
      });
      if (authError) throw authError;
      targetUser = authUser.user;
    }

    if (targetUser) {
      await supabaseAdmin.from('user_profile').upsert({
        id: targetUser.id,
        name: 'G-FitLife Master',
        email: email,
        role: 'admin_master',
        status: 'active',
        loginType: 'hybrid',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });
      console.log('[CORE-SEED] Sistema Master operando.');
    }
  } catch (err) {
    console.error('[CORE-SEED] Falha no Seed:', err.message);
  }
}

seedMasterUser();

// Middlewares de Segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- API ROUTES ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS (Prioridade Total) ---
const distPath = path.resolve(__dirname, 'dist');

// Servir arquivos físicos se existirem
app.use(express.static(distPath, {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Fallback SPA (Somente para rotas de navegação)
app.get('*', (req, res) => {
  // Se a requisição tem extensão (ex: .css, .js, .png) e chegou aqui, o arquivo NÃO existe
  // Retornamos 404 para evitar que o navegador receba HTML no lugar de um asset
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    return res.status(404).send('Resource not found');
  }

  // Caso contrário, serve o index.html para o React Router lidar com a rota
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Application build missing. Please run npm run build.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE SERVER ONLINE @ PORT ${PORT}`);
});