
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as nodeProcess from 'process';

export default defineConfig(({ mode }) => {
  // Carrega variáveis dos arquivos .env (VITE_ prefixadas por padrão)
  // Fix: Using process.cwd() directly to resolve the type error where nodeProcess was incorrectly inferred without the cwd() method.
  const env = loadEnv(mode, process.cwd(), '');

  // Prioriza variáveis de ambiente do SISTEMA (Railway) sobre as do arquivo .env
  // Mapeia tanto nomes comuns (SUPABASE_URL) quanto específicos do Vite (VITE_SUPABASE_URL)
  const supabaseUrl = 
    nodeProcess.env.VITE_SUPABASE_URL || 
    nodeProcess.env.SUPABASE_URL || 
    env.VITE_SUPABASE_URL || 
    env.SUPABASE_URL || 
    '';

  const supabaseAnonKey = 
    nodeProcess.env.VITE_SUPABASE_ANON_KEY || 
    nodeProcess.env.SUPABASE_ANON_KEY || 
    env.VITE_SUPABASE_ANON_KEY || 
    env.SUPABASE_ANON_KEY || 
    '';

  const apiKey = 
    nodeProcess.env.API_KEY || 
    env.API_KEY || 
    '';

  console.log(`[GFIT-BUILD] Configurando build para modo: ${mode}`);
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[GFIT-BUILD-WARN] Credenciais do Supabase não encontradas no ambiente de build!');
  }

  return {
    plugins: [react()],
    define: {
      // Substituições globais para compatibilidade com código que usa process.env
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Fallback para import.meta.env
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    }
  };
});
