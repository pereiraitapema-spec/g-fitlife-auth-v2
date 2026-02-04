
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

    console.log('[CORE-SEED] Iniciando validação de infraestrutura...');
    
    // Verificação de existência do usuário no Auth via listUsers
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
      // Garantir perfil na tabela pública (user_profile singular)
      const { error: profileError } = await supabaseAdmin.from('user_profile').upsert({
        id: targetUser.id,
        name: 'G-FitLife Master',
        email,
        role: 'admin_master',
        status: 'active',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

      if (profileError) throw profileError;
      console.log('[CORE-SEED] Infraestrutura Master pronta para uso.');
    }
  } catch (err) {
    console.error('[CORE-SEED] Falha no processo de seed:', err.message);
  }
}

// Execução controlada do Seed
seedMasterUser();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Login via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    });

    if (error) return res.status(401).json({ error: 'Credenciais inválidas ou acesso negado.' });

    // Busca do perfil para retorno completo
    const { data: profile } = await supabaseAdmin
      .from('user_profile')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    res.status(200).json({ 
      session: data.session, 
      user: data.user, 
      profile 
    });
  } catch (err) {
    res.status(500).json({ error: 'Falha interna no servidor de autenticação.' });
  }
});

// --- ROTAS ADMINISTRATIVAS ---

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

    const { error: profileError } = await supabaseAdmin.from('user_profile').insert({
      id: authUser.user.id,
      name,
      email,
      role,
      status: 'active',
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
