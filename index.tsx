
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Importação obrigatória para bundle CSS via JS

const container = document.getElementById('root');

if (!container) {
  console.error("Falha fatal: Elemento #root não encontrado no DOM.");
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
