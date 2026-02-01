
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Seller } from '../types';

const MarketplaceSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Seller>>({ name: '', email: '', commissionRate: 15, status: 'active' });

  useEffect(() => {
    const load = async () => {
      const data = await storeService.getSellers();
      setSellers(data);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSeller: Seller = {
      id: 'SEL-' + Date.now(),
      userId: 'u-temp',
      name: formData.name || '',
      email: formData.email || '',
      status: formData.status as any,
      commissionRate: formData.commissionRate || 15,
      totalSales: 0,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    // Fix: Await save and reload
    await storeService.saveSeller(newSeller);
    const data = await storeService.getSellers();
    setSellers(data);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', commissionRate: 15, status: 'active' });
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Lojistas</h2>
          <p className="text-slate-500 font-medium">Controle os parceiros que vendem na plataforma G-FitLife.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-emerald-500 transition-all active:scale-95"
        >
          + CADASTRAR VENDEDOR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
         {[
           { label: 'Total Lojistas', value: sellers.length, icon: '🏪', color: 'blue' },
           { label: 'Vendas Marketplace', value: 'R$ 0,00', icon: '💰', color: 'emerald' },
           { label: 'Comissão Média', value: '15.2%', icon: '📊', color: 'amber' },
         ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
               <div className={`w-14 h-14 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-2xl flex items-center justify-center text-2xl`}>{stat.icon}</div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lojista</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Taxa Mkp</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sellers.map(sel => (
              <tr key={sel.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase">{sel.name.slice(0,2)}</div>
                     <p className="font-black text-slate-800 text-sm">{sel.name}</p>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">{sel.email}</td>
                <td className="px-8 py-6 text-center font-black text-emerald-500">{sel.commissionRate}%</td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    sel.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {sel.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">Configurar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[50px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-8">Novo Lojista</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <input required placeholder="Nome Fantasia" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              <input required type="email" placeholder="E-mail Administrativo" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Taxa Marketplace (%)</label>
                <input type="number" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: parseInt(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 outline-none font-bold" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all">SALVAR BACKEND</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceSellers;
