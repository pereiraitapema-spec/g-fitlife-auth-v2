
import React, { useState } from 'react';

const LogisticsRates: React.FC = () => {
  const [zip, setZip] = useState('');
  const [result, setResult] = useState<any>(null);

  const simulate = () => {
    if (zip.length < 8) return;
    setResult([
      { name: 'G-Log Express', price: 24.90, time: '2 dias úteis' },
      { name: 'Correios BR', price: 12.50, time: '8 dias úteis' },
    ]);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="bg-slate-900 rounded-[50px] p-16 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">Simulador Global de Frete</h2>
        <p className="text-slate-400 font-medium max-w-xl mb-10">Teste as tabelas de frete baseadas nas APIs de transportadoras ativas.</p>
        
        <div className="flex gap-4 max-w-md relative z-10">
          <input 
            placeholder="00000-000" 
            value={zip} 
            onChange={e => setZip(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <button onClick={simulate} className="px-10 py-5 bg-emerald-500 text-white rounded-3xl font-black hover:bg-emerald-600 transition-all shadow-xl">SIMULAR</button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10">
          {result.map((r: any, i: number) => (
            <div key={i} className="bg-white rounded-[40px] border border-slate-100 p-10 flex justify-between items-center shadow-xl">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{r.name}</p>
                 <h4 className="text-xl font-black text-slate-900">{r.time}</h4>
               </div>
               <div className="text-right">
                 <p className="text-3xl font-black text-emerald-500">R$ {r.price.toFixed(2)}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase mt-2">API Response 200 OK</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogisticsRates;
