<!DOCTYPE html>
<html lang="pt-BR">
<head>
&nbsp;&nbsp;&nbsp;&nbsp;<meta charset="UTF-8">
&nbsp;&nbsp;&nbsp;&nbsp;<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
&nbsp;&nbsp;&nbsp;&nbsp;<title>G-FitLife | Saúde & Performance</title>
&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;<!-- PWA & Mobile Optimization -->
&nbsp;&nbsp;&nbsp;&nbsp;<meta name="theme-color" content="#0f172a">
&nbsp;&nbsp;&nbsp;&nbsp;<meta name="apple-mobile-web-app-capable" content="yes">
&nbsp;&nbsp;&nbsp;&nbsp;<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
&nbsp;&nbsp;&nbsp;&nbsp;<meta name="apple-mobile-web-app-title" content="G-FitLife">
&nbsp;&nbsp;&nbsp;&nbsp;<link rel="apple-touch-icon" href="https://picsum.photos/seed/gfit-logo/192/192">
&nbsp;&nbsp;&nbsp;&nbsp;<link rel="manifest" href="manifest.json">
&nbsp;&nbsp;&nbsp;&nbsp;<script src="https://cdn.tailwindcss.com"></script>
&nbsp;&nbsp;&nbsp;&nbsp;<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
&nbsp;&nbsp;&nbsp;&nbsp;<style>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;body {
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;font-family: 'Inter', sans-serif;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-webkit-tap-highlight-color: transparent;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/* Garante que nada bloqueie o clique globalmente */
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pointer-events: auto !important;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;user-select: auto !important;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.gradient-text { background: linear-gradient(90deg, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.custom-scrollbar::-webkit-scrollbar { width: 4px; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/* Mobile Specific Overrides */
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@media (max-width: 640px) {
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.rounded-50px { border-radius: 40px !important; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.p-12 { padding: 1.5rem !important; }
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
&nbsp;&nbsp;&nbsp;&nbsp;</style>
<script type="importmap">
{
&nbsp;&nbsp;"imports": {
&nbsp;&nbsp;&nbsp;&nbsp;"react": "https://esm.sh/react@^19.2.4",
&nbsp;&nbsp;&nbsp;&nbsp;"react-dom/": "https://esm.sh/react-dom@^19.2.4/",
&nbsp;&nbsp;&nbsp;&nbsp;"react/": "https://esm.sh/react@^19.2.4/",
&nbsp;&nbsp;&nbsp;&nbsp;"@google/genai": "https://esm.sh/@google/genai@^1.38.0",
&nbsp;&nbsp;&nbsp;&nbsp;"@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@^2.93.3",
&nbsp;&nbsp;&nbsp;&nbsp;"vite": "https://esm.sh/vite@^7.3.1",
&nbsp;&nbsp;&nbsp;&nbsp;"@vitejs/plugin-react": "https://esm.sh/@vitejs/plugin-react@^5.1.3"
&nbsp;&nbsp;}
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
<body class="bg-slate-50 text-slate-900 overflow-x-hidden">
&nbsp;&nbsp;&nbsp;&nbsp;<div id="root"></div>
&nbsp;&nbsp;&nbsp;&nbsp;<script type="module" src="index.tsx"></script>
<script type="module" src="/index.tsx"></script>
</body>
</html>
