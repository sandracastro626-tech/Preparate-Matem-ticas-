import React from 'react';
import { Search, User } from 'lucide-react';
import NotificacionesCampana from './NotificacionesCampana';

const Header = ({ title, subtitle, user, onNavigate, children }) => {
  return (
    <header className="bg-white border-b border-slate-100 py-6 px-10 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        {children}
        
        <NotificacionesCampana 
          usuarioActual={user} 
          setVistaActual={onNavigate} 
        />

        <div className="w-px h-8 bg-slate-100"></div>

        <button className="flex items-center gap-3 p-1 pl-4 hover:bg-slate-50 rounded-2xl transition-all group">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-800">{user?.nombreCompleto || 'Usuario'}</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.rol || 'Visitante'}</span>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
            <User size={20} />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
