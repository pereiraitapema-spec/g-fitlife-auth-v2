
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { supabaseAdmin } = require('./backend/supabaseAdmin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Seed Master com Verificação de Duplicidade (Proteção de Banco)
async function seedMasterUser() {
  try {
    const email = (process.env.MASTER_EMAIL || 'admin@system.local').toLowerCase();
    const password = process.env.MASTER_PASSWORD || 'admin123';

    console.log('[CORE-SEED] Validando infraestrutura Master...');
    
    // Verifica se já existe no Auth via Admin API
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = usersData.users.find(u => u.email.toLowerCase() === email);

    if (!targetUser) {
      console.log('[CORE-SEED] Criando conta Master no Auth Service...');
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
      // Upsert no Perfil (Garante que a tabela singular user_profile esteja em sincronia)
      const { error: profileError } = await supabaseAdmin.from('user_profile').upsert({
        id: targetUser.id,
        name: 'G-FitLife Master',
        email: email,
        role: 'admin_master',
        status: 'active',
        loginType: 'hybrid',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

      if (profileError) throw profileError;
      console.log('[CORE-SEED] G-FitLife Master pronto para operação.');
    }
  } catch (err) {
    console.error('[CORE-SEED] Erro na inicialização:', err.message);
  }
}

// Rodar Seed na inicialização
seedMasterUser();

// Middlewares de Segurança e Log
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- ROTAS ADMINISTRATIVAS (Utilizam Service Role) ---

app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { role }
    });
    
    if (authError) return res.status(400).json({ error: authError.message });

    const { error: profileError } = await supabaseAdmin.from('user_profile').insert({
      id: authUser.user.id,
      name,
      email: email.toLowerCase(),
      role,
      status: 'active',
      loginType: 'hybrid',
      created_at: new Date().toISOString()
    });

    if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        return res.status(400).json({ error: 'Erro ao criar perfil no banco.' });
    }

    res.status(201).json({ status: 'ok', userId: authUser.user.id });
  } catch (err) {
    res.status(500).json({ error: 'Falha interna no servidor admin.' });
  }
});

app.delete('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    const masterEmail = (process.env.MASTER_EMAIL || 'admin@system.local').toLowerCase();
    
    if (user?.user?.email.toLowerCase() === masterEmail) {
      return res.status(403).json({ error: 'Proibido excluir a conta Master.' });
    }

    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabaseAdmin.from('user_profile').delete().eq('id', userId);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover registros.' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS (BUILD VITE) ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback SPA - Importante para evitar MIME type error ao dar refresh em sub-rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE BACKEND ONLINE NA PORTA ${PORT}`);
});
