
import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { UserSession } from '../types';

interface LGPDUserDataPageProps {
  currentUser: UserSession;
}

const LGPDUserDataPage: React.FC<LGPDUserDataPageProps> = ({ currentUser }) => {
  const [data, setData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setData(storeService.getUserPersonalData(currentUser.userEmail));
  }, [currentUser]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `gfitlife_data_${currentUser.userEmail}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    storeService.logLGPD('data_export', currentUser.userEmail, 'Usuário exportou seus dados pessoais.');
  };

  const handleDelete = () => {
    if (confirm('ATENÇÃO: Esta ação é irreversível e excluirá todos os seus dados da plataforma. Deseja continuar?')) {
      setIsDeleting(true);
      setTimeout(() => {
        storeService.deleteUserPersonalData(currentUser.userEmail);
        alert('Dados excluídos com sucesso em conformidade com a LGPD.');
        window.location.reload();
      }, 3000);
    }
  };

  if (!data) return null;

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meus Dados & Portabilidade</h2>
          <p className="text-slate-500 font-medium">Transparência total sobre quais informações armazenamos sobre você.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleExport} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95">EXPORTAR MEUS DADOS (JSON)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4">Informações de Perfil</h3>
            <div className="space-y-4">
               <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-400">Nome Completo:</span>
                  <span className="text-slate-800 font-bold">{data.user?.name}</span>
               </div>
               <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="text-slate-800 font-bold">{data.user?.email}</span>
               </div>
               <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-400">Data de Cadastro:</span>
                  <span className="text-slate-800 font-bold">{new Date(data.user?.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[50px] border border-slate-100 p-10 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4">Atividade Registrada</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-slate-50 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedidos</p>
                  <p className="text-2xl font-black text-slate-900">{data.orders.length}</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interesses (Leads)</p>
                  <p className="text-2xl font-black text-slate-900">{data.leads.length}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-red-50 rounded-[50px] p-12 border border-red-100 space-y-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
         <h3 className="text-xl font-black text-red-600">Direito ao Esquecimento</h3>
         <p className="text-red-500/70 text-sm max-w-2xl font-medium leading-relaxed">
           Você tem o direito de solicitar a exclusão definitiva de seus dados pessoais de nossos sistemas. 
           Lembramos que dados fiscais e de transações financeiras podem ser retidos por prazos legais específicos (conforme Art. 16 da LGPD).
         </p>
         <button 
           onClick={handleDelete}
           disabled={isDeleting}
           className="px-10 py-5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
         >
           {isDeleting ? 'PROCESSANDO EXCLUSÃO...' : 'EXCLUIR TODOS OS MEUS DADOS'}
         </button>
      </div>
    </div>
  );
};

export default LGPDUserDataPage;
