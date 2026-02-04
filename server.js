
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { supabaseAdmin } = require('./backend/supabaseAdmin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Seed Automático do Usuário Master (Utiliza SERVICE_ROLE via supabaseAdmin)
async function seedMasterUser() {
  try {
    const email = process.env.MASTER_EMAIL || 'admin@system.local';
    const password = process.env.MASTER_PASSWORD || 'admin123';

    console.log('[CORE-SEED] Validando Usuário Master via Service Role...');
    
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = usersData.users.find(u => u.email === email);

    if (!targetUser) {
      console.log('[CORE-SEED] Criando novo Master no Auth...');
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
      // CORREÇÃO: Tabela 'user_profile' (singular)
      const { error: profileError } = await supabaseAdmin.from('user_profile').upsert({
        id: targetUser.id,
        name: 'G-FitLife Master',
        email,
        role: 'admin_master',
        status: 'active',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

      if (profileError) throw profileError;
      console.log('[CORE-SEED] Perfil Master em "user_profile" garantido.');
    }
  } catch (err) {
    console.error('[CORE-SEED] Falha na inicialização segura:', err.message);
  }
}

seedMasterUser();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 3. API Administrativa Segura (Usa Service Role para gerenciar Auth)
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Criação no Auth via Admin Client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });
    
    if (authError) return res.status(400).json({ error: authError.message });

    // Inserção no perfil público (tabela user_profile)
    const { error: profileError } = await supabaseAdmin.from('user_profile').insert({
      id: authUser.user.id,
      name,
      email,
      role,
      status: 'active',
      created_at: new Date().toISOString()
    });

    if (profileError) {
        // Rollback do usuário auth caso falhe a criação do perfil
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({ status: 'ok', userId: authUser.user.id });
  } catch (err) {
    res.status(500).json({ error: 'Falha interna na criação' });
  }
});

app.delete('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    const masterEmail = process.env.MASTER_EMAIL || 'admin@system.local';
    
    if (user?.user?.email === masterEmail) {
      return res.status(403).json({ error: 'Operação proibida para o Core Master' });
    }

    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabaseAdmin.from('user_profile').delete().eq('id', userId);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover do Supabase' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE CORE ONLINE NA PORTA ${PORT}`);
});
