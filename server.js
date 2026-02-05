import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static Files & SPA Fallback
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Fallback para todas as rotas (SPA)
app.get('*', (req, res) => {
  // Evitar loops em arquivos não encontrados
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 G-FITLIFE ENTERPRISE ONLINE @ PORT ${PORT}`);
});