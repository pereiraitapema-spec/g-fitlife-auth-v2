
import React, { useState, useEffect } from 'react';
import { UserSession, AppUser } from '../types';
import { storeService } from '../services/storeService';

interface HeaderSimpleProps {
  onToggleSidebar: () => void;
  title: string;
  user: UserSession;
}

const HeaderSimple: React.FC<HeaderSimpleProps> = ({ onToggleSidebar, title, user }) => {
  const [settings, setSettings] = useState<any>(null);
  const [userData, setUserData] = useState<AppUser | undefined>();

  useEffect(() => {
    // Initial load
    const loadInitial = async () => {
      const s = await storeService.getSettings();
      setSettings(s);
      const allUsers = await storeService.getUsers();
      setUserData(allUsers.find(u => u.id === user.userId));
    };
    loadInitial();

    const handleSettingsChange = async () => {
      const s = await storeService.getSettings();
      setSettings(s);
    };
    const handleUsersChange = async () => {
      const allUsers = await storeService.getUsers();
      setUserData(allUsers.find(u => u.id === user.userId));
    };
    
    window.addEventListener('systemSettingsChanged', handleSettingsChange);
    window.addEventListener('usersChanged', handleUsersChange);
    
    return () => {
      window.removeEventListener('systemSettingsChanged', handleSettingsChange);
      window.removeEventListener('usersChanged', handleUsersChange);
    };
  }, [user.userId]);

  if (!settings) return null;

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40 sticky top-0 shadow-sm">
      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleSidebar}
          className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
           <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest whitespace-nowrap">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="w-8 h-8 rounded-lg overflow-hidden border border-white shadow-sm">
              <img src={settings.logoUrl || 'https://picsum.photos/seed/gfitlife/200/200'} className="w-full h-full object-cover" alt="" />
           </div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{settings.storeName}</span>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">{userData?.name || user.userName}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{user.userRole.replace('_', ' ')}</p>
           </div>
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-xl overflow-hidden">
              <img src={userData?.googleId || `https://ui-avatars.com/api/?name=${user.userName}&background=0f172a&color=fff&bold=true`} className="w-full h-full object-cover" alt="User" />
           </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSimple;
