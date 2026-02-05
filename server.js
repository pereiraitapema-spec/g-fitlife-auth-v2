
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { supabaseAdmin } = require('./backend/supabaseAdmin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Seed Master Seguro (Utiliza SERVICE_ROLE)
async function seedMasterUser() {
  try {
    const email = process.env.MASTER_EMAIL || 'admin@system.local';
    const password = process.env.MASTER_PASSWORD || 'admin123';

    console.log('[CORE-SEED] Validando integridade da base Master...');
    
    // Lista usuários para evitar duplicidade
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = usersData.users.find(u => u.email === email);

    if (!targetUser) {
      console.log('[CORE-SEED] Criando credenciais Master no Auth Service...');
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
      // Upsert no perfil (tabela singular user_profile)
      const { error: profileError } = await supabaseAdmin.from('user_profile').upsert({
        id: targetUser.id,
        name: 'G-FitLife Master',
        email,
        role: 'admin_master',
        status: 'active',
        loginType: 'hybrid',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

      if (profileError) throw profileError;
      console.log('[CORE-SEED] Infraestrutura Master G-FitLife operacional.');
    }
  } catch (err) {
    console.error('[CORE-SEED] Falha no Seed:', err.message);
  }
}

seedMasterUser();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- ROTAS DE API ---

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Admin: Criar Usuário (Usa Service Role)
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check duplicado
    const { data: existing } = await supabaseAdmin.from('user_profile').select('id').eq('email', email.toLowerCase()).maybeSingle();
    if (existing) return res.status(400).json({ error: 'E-mail já registrado.' });

    // Criar no Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });
    
    if (authError) return res.status(400).json({ error: authError.message });

    // Criar no Perfil
    const { error: profileError } = await supabaseAdmin.from('user_profile').insert({
      id: authUser.user.id,
      name,
      email,
      role,
      status: 'active',
      loginType: 'hybrid',
      created_at: new Date().toISOString()
    });

    if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({ status: 'ok', userId: authUser.user.id });
  } catch (err) {
    res.status(500).json({ error: 'Falha interna na criação' });
  }
});

// Admin: Deletar Usuário
app.delete('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    const masterEmail = process.env.MASTER_EMAIL || 'admin@system.local';
    
    if (user?.user?.email === masterEmail) {
      return res.status(403).json({ error: 'Operação proibida para o Master.' });
    }

    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabaseAdmin.from('user_profile').delete().eq('id', userId);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover dados.' });
  }
});

// Servir arquivos estáticos do build do React/Vite
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback para SPA (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR ONLINE NA PORTA ${PORT}`);
});
