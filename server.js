const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Cliente Admin do Supabase (ignora RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 1. Seed Automático do Usuário Master
async function seedMasterUser() {
  try {
    const email = 'admin@system.local';
    const password = 'admin123';

    console.log('[SEED] Validando integridade do usuário Master...');
    
    const { data: userByEmail } = await supabaseAdmin.auth.admin.listUsers();
    let targetUser = userByEmail.users.find(u => u.email === email);

    if (!targetUser) {
      console.log('[SEED] Criando novo usuário Master no Auth...');
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
        name: 'Super Admin G-FitLife',
        email,
        role: 'admin_master',
        status: 'active',
        created_at: new Date().toISOString()
      });

      if (profileError) throw profileError;
      console.log('[SEED] Master User (admin@system.local) pronto para uso.');
    }
  } catch (err) {
    console.error('[SEED] Erro no bootstrap:', err.message);
  }
}

// Executar seed ao iniciar
seedMasterUser();

// 2. Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 3. Rotas de API Administrativa
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
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
});

app.delete('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Proteção: não excluir o admin do seed
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (user?.user?.email === 'admin@system.local') {
      return res.status(403).json({ error: 'Proibido excluir o Core Master' });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) return res.status(400).json({ error: authError.message });

    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (profileError) return res.status(400).json({ error: profileError.message });

    res.status(200).json({ status: 'ok', message: 'Usuário removido totalmente' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno na exclusão' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 4. Servir Frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE BACKEND ONLINE PORTA ${PORT}`);
});