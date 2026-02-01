
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { AuditLog } from '../types';

const SecurityAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Adicionado await para carregar logs de auditoria e aplicar reverse()
    const load = async () => {
      setLogs((await storeService.getAuditLogs()).reverse());
    };
    load();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trilha de Auditoria</h2>
          <p className="text-slate-500 font-medium">Registro cronológico de todas as modificações no banco de dados.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Log</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação Realizada</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">Nenhuma ação auditada registrada.</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-mono text-[10px] text-slate-400 uppercase">{log.id}</td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-800">{log.userName}</p>
                  <p className="text-[10px] text-slate-400">ID: {log.userId}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {log.action}
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-bold text-slate-400 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityAudit;
