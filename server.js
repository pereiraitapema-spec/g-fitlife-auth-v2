
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from './backend/supabaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Seed Master Account
async function seedMasterUser() {
  try {
    const email = (process.env.MASTER_EMAIL || 'admin@system.local').toLowerCase();
    const password = process.env.MASTER_PASSWORD || 'admin123';

    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = usersData.users.find(u => u.email.toLowerCase() === email);

    if (!targetUser) {
      console.log('[GFIT-BACKEND] Criando conta Master inicial...');
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
        login_type: 'hybrid',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });
      console.log('[GFIT-BACKEND] Sistema Master OK.');
    }
  } catch (err) {
    console.error('[GFIT-BACKEND] Erro no Seed:', err.message);
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

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Static Files & SPA Fallback
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 G-FITLIFE SERVER ONLINE @ PORT ${PORT}`);
});
