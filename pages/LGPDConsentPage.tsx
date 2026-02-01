
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { LGPDConsent } from '../types';

const LGPDConsentPage: React.FC = () => {
  const [consents, setConsents] = useState<LGPDConsent[]>([]);

  useEffect(() => {
    // Adicionado await para carregar consentimentos e aplicar reverse()
    const load = async () => {
      setConsents((await storeService.getConsents()).reverse());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Registro de Consentimentos</h2>
          <p className="text-slate-500 font-medium">Trilha legal de aceites de políticas de privacidade e cookies.</p>
        </div>
        <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
           {consents.length} Consentimentos Ativos
        </div>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Endereço IP</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {consents.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-mono text-[10px] text-slate-400 uppercase">{c.id}</td>
                <td className="px-8 py-6">
                  <p className="font-black text-slate-800 text-sm">{c.userEmail}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Aceite Confirmado</p>
                </td>
                <td className="px-8 py-6 text-center font-bold text-slate-500 text-xs">{c.ip}</td>
                <td className="px-8 py-6 text-right font-black text-slate-400 text-[10px]">
                  {new Date(c.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LGPDConsentPage;
