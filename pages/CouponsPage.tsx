
import React, { useState, useEffect } from 'react';
import { Coupon, CouponType } from '../types';
import { storeService } from '../services/storeService';

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    code: '', 
    type: CouponType.PERCENTAGE, 
    value: 0, 
    status: 'active' as const,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const data = await storeService.getCoupons();
    setCoupons(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newCoupon: Coupon = {
        ...formData,
        // CORREÇÃO: Usar UUID real. O erro 22P02 indica que o banco exige UUID.
        id: crypto.randomUUID(),
        expiresAt: new Date(formData.expiresAt).toISOString()
      };
      await storeService.saveCoupon(newCoupon);
      await loadData();
      setIsModalOpen(false);
      showFeedback("Cupom criado no banco");
      setFormData({ 
        code: '', 
        type: CouponType.PERCENTAGE, 
        value: 0, 
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (error) {
      showFeedback("Erro ao criar cupom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = { ...coupon, status: coupon.status === 'active' ? 'inactive' : 'active' } as Coupon;
      await storeService.saveCoupon(updated);
      await loadData();
      showFeedback("Status do cupom atualizado");
    } catch (error) {
      showFeedback("Erro ao atualizar status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl border border-emerald-500 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-10">
          {feedback}
        </div>
      )}

      <div className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Cupons</h2>
          <p className="text-slate-500">Gestão persistente de ofertas (Supabase Sync).</p>
        </div>
        <button 
          disabled={isSubmitting}
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          + NOVO CUPOM
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Código</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Expira</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-black text-slate-800 text-sm tracking-widest uppercase">{coupon.code}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900">
                    {coupon.type === CouponType.PERCENTAGE ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                  </p>
                </td>
                <td className="px-6 py-5 text-center">
                   <p className="text-[10px] font-bold text-slate-400">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR') : 'Sem data'}</p>
                </td>
                <td className="px-6 py-5 text-right">
                   <button disabled={isSubmitting} onClick={() => toggleStatus(coupon)} className="text-xs font-black text-slate-400 uppercase disabled:opacity-30">{coupon.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Novo Cupom</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Código do Cupom</label>
                <input required disabled={isSubmitting} placeholder="FIT2024" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-slate-50 rounded-2xl p-5 font-black outline-none shadow-inner" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo</label>
                  <select disabled={isSubmitting} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CouponType})} className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none">
                    <option value={CouponType.PERCENTAGE}>PORCENTAGEM (%)</option>
                    <option value={CouponType.FIXED}>FIXO (R$)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Valor</label>
                  <input 
                    required 
                    disabled={isSubmitting} 
                    type="number" 
                    step="0.01" 
                    value={isNaN(formData.value) ? '' : formData.value} 
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFormData({...formData, value: isNaN(val) ? 0 : val});
                    }} 
                    className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Data de Expiração</label>
                <input 
                  required 
                  type="date"
                  disabled={isSubmitting} 
                  value={formData.expiresAt} 
                  onChange={e => setFormData({...formData, expiresAt: e.target.value})} 
                  className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none shadow-inner" 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">
                  {isSubmitting ? 'CRIANDO...' : 'CRIAR NO BANCO'}
                </button>
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
