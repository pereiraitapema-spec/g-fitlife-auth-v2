import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração obrigatória para o build do React com Vite
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  }
});