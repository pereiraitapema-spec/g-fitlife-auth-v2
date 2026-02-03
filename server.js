const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Importação do cliente admin corrigido
const { supabaseAdmin } = require('./backend/supabaseAdmin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Seed Automático do Usuário Master (admin@system.local / admin123)
async function seedMasterUser() {
  try {
    const email = 'admin@system.local';
    const password = 'admin123';

    console.log('[CORE-SEED] Verificando integridade do Master...');
    
    const { data: userByEmail } = await supabaseAdmin.auth.admin.listUsers();
    let targetUser = userByEmail.users.find(u => u.email === email);

    if (!targetUser) {
      console.log('[CORE-SEED] Master não encontrado no Auth. Criando...');
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
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: targetUser.id,
        name: 'G-FitLife Master',
        email,
        role: 'admin_master',
        status: 'active',
        created_at: new Date().toISOString()
      });

      if (profileError) throw profileError;
      console.log('[CORE-SEED] Master User validado e ativo.');
    }
  } catch (err) {
    console.error('[CORE-SEED] Falha crítica:', err.message);
  }
}

// Executar seed ao subir o servidor
seedMasterUser();

// 2. Middlewares de Segurança e Log
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 3. API Administrativa (Utiliza o supabaseAdmin seguro no backend)
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });
    if (authError) return res.status(400).json({ error: authError.message });

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authUser.user.id,
      name,
      email,
      role,
      status: 'active',
      created_at: new Date().toISOString()
    });
    if (profileError) return res.status(400).json({ error: profileError.message });

    res.status(201).json({ status: 'ok', userId: authUser.user.id });
  } catch (err) {
    res.status(500).json({ error: 'Falha interna na criação' });
  }
});

app.delete('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (user?.user?.email === 'admin@system.local') {
      return res.status(403).json({ error: 'Operação proibida para o Core Master' });
    }

    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover do Supabase' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 4. Servir Build do React (Vite)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE CORE ONLINE NA PORTA ${PORT}`);
});