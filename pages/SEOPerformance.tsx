
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { PerformanceMetric } from '../types';

const SEOPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    setMetrics(storeService.getPerformanceMetrics());
  }, []);

  const getScoreColor = (val: number, type: 'lcp' | 'fid' | 'cls') => {
    if (type === 'lcp') return val < 1.0 ? 'text-emerald-500' : val < 2.5 ? 'text-amber-500' : 'text-red-500';
    if (type === 'fid') return val < 50 ? 'text-emerald-500' : val < 100 ? 'text-amber-500' : 'text-red-500';
    return val < 0.1 ? 'text-emerald-500' : 'text-red-500';
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Velocidade & UX</h2>
          <p className="text-slate-500 font-medium">Monitore os indicadores de performance que afetam seu ranking.</p>
        </div>
        <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
          Score Global: 98/100
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'LCP (Largest Contentful Paint)', desc: 'Tempo de carregamento principal.', value: '0.9s', score: 0.9, type: 'lcp' },
          { label: 'FID (First Input Delay)', desc: 'Interatividade da página.', value: '25ms', score: 25, type: 'fid' },
          { label: 'CLS (Cumulative Layout Shift)', desc: 'Estabilidade visual.', value: '0.04', score: 0.04, type: 'cls' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className={`text-5xl font-black ${getScoreColor(item.score as any, item.type as any)} tracking-tighter`}>{item.value}</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <p className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Métricas por Página (Persistidas no Backend)</p>
        <table className="w-full text-left">
          <thead className="bg-slate-50/30">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Caminho URL</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LCP</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">FID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CLS</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {metrics.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5"><p className="text-sm font-bold text-slate-800">{m.page}</p></td>
                <td className="px-8 py-5 text-center font-black text-emerald-500">{m.lcp}s</td>
                <td className="px-8 py-5 text-center font-black text-emerald-500">{m.fid}ms</td>
                <td className="px-8 py-5 text-center font-black text-emerald-500">{m.cls}</td>
                <td className="px-8 py-5 text-right text-[10px] font-bold text-slate-400">{new Date(m.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SEOPerformance;
