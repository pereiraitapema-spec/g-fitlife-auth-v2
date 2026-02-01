
import React, { useState, useEffect } from 'react';
import { Department, Category } from '../types';
import { storeService } from '../services/storeService';

interface PublicDepartmentsProps {
  onNavigate: (route: any) => void;
}

const PublicDepartments: React.FC<PublicDepartmentsProps> = ({ onNavigate }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  /* Fixed: loadData needs to await for async storeService methods */
  const loadData = async () => {
    const dData = await storeService.getDepartments();
    const cData = await storeService.getCategories();
    setDepartments(dData.filter(d => d.status === 'active'));
    setCategories(cData.filter(c => c.status === 'active'));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 space-y-16 py-10">
      <div className="text-center space-y-4">
         <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Explore por <span className="text-emerald-500">Áreas</span></h2>
         <p className="text-slate-500 font-medium max-w-xl mx-auto">Encontre soluções focadas em seus objetivos específicos de saúde e treino.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         {departments.map(dept => (
           <div key={dept.id} className="bg-white rounded-[60px] border border-slate-100 p-12 shadow-sm hover:shadow-2xl transition-all group border-b-8 border-b-emerald-500">
              <div className="flex justify-between items-start mb-10">
                 <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-4xl group-hover:rotate-6 transition-transform">🧬</div>
                 <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ativo</span>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">{dept.name}</h3>
              
              <div className="space-y-3 mb-12">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Subcategorias Disponíveis</p>
                 <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.departmentId === dept.id).map(cat => (
                      <span key={cat.id} className="px-5 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 hover:border-emerald-500 hover:text-emerald-500 cursor-pointer transition-all">
                        {cat.name}
                      </span>
                    ))}
                    {categories.filter(c => c.departmentId === dept.id).length === 0 && <p className="text-xs text-slate-300 italic">Carregando categorias...</p>}
                 </div>
              </div>

              <button 
                onClick={() => onNavigate('store-catalog')}
                className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-xl group-hover:bg-emerald-500 transition-all"
              >
                VER TODOS OS PRODUTOS DE {dept.name.toUpperCase()}
              </button>
           </div>
         ))}

         {departments.length === 0 && (
            <div className="col-span-full p-20 text-center bg-slate-50 rounded-[60px] border-4 border-dashed border-white">
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Carregando Departamentos do Sistema...</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default PublicDepartments;
