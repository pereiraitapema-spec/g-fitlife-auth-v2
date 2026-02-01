
import React, { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenCoach: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenCoach }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">G</div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              FIT<span className="text-emerald-500 underline decoration-2 underline-offset-4">LIFE</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-emerald-500 transition-colors">Produtos</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-emerald-500 transition-colors">Categorias</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-emerald-500 transition-colors">Afiliados</a>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-emerald-500 transition-colors">Sobre</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenCoach}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-emerald-600 transition-all shadow-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              IA COACH
            </button>

            <button 
              onClick={onOpenCart}
              className="relative p-2 text-slate-600 hover:text-emerald-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <a href="#" className="block text-slate-600 font-medium">Produtos</a>
          <a href="#" className="block text-slate-600 font-medium">Categorias</a>
          <a href="#" className="block text-slate-600 font-medium">Afiliados</a>
          <button onClick={onOpenCoach} className="w-full text-left py-2 px-4 bg-slate-100 rounded-lg font-bold text-emerald-600">Falar com IA Coach</button>
        </div>
      )}
    </header>
  );
};

export default Header;
