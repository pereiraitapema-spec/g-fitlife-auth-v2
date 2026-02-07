
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Server Client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// 1. Arquivos estáticos do build (Vite dist)
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// 2. Rotas Obrigatórias do Sistema
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ success: false, error: error.message });
    return res.json({ success: true, user: data.user, session: data.session });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, user: data.user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * ROTA DE RECUPERAÇÃO DE SENHA (BACKEND)
 * Ajustada para remover barra final da URL de redirecionamento.
 */
app.post('/auth/recover', async (req, res) => {
  const { email } = req.body;
  const baseUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, "");
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: baseUrl
    });
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * ROTA DE ATUALIZAÇÃO DE SENHA
 */
app.post('/auth/update-password', async (req, res) => {
  const { password } = req.body;
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 3. Fallback para Single Page Application (SPA)
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Resource not found');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  ==================================================
  🚀 G-FITLIFE PROFESSIONAL BACKEND ACTIVE
  ==================================================
  `);
});
