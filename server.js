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

    console.log('[SEED] Verificando existência de usuário Master...');
    
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!existingUser) {
      console.log('[SEED] Criando usuário Master padrão...');
      
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin_master' }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: authUser.user.id,
        name: 'Super Admin G-FitLife',
        email,
        role: 'admin_master',
        status: 'active',
        created_at: new Date().toISOString()
      });

      if (profileError) throw profileError;
      console.log('[SEED] Master User configurado com sucesso.');
    } else {
      console.log('[SEED] Master User já ativo no sistema.');
    }
  } catch (err) {
    console.error('[SEED] Falha crítica no bootstrap do Master:', err.message);
  }
}

// Executar seed ao iniciar
if (process.env.NODE_ENV !== 'test') seedMasterUser();

// 2. Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desativado para facilitar carregamento de assets externos no ambiente Studio
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 3. Rotas de API Administrativa
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Criação no Auth do Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Criação no Perfil Público
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
    res.status(500).json({ error: 'Erro interno ao criar administrador' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', system: 'G-FitLife Enterprise', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Acesso auditado' });
});

// 4. Servir Frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE SERVER ONLINE NA PORTA ${PORT}`);
});