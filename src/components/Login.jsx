import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, User, GraduationCap, ArrowRight, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      const res = login(formData.email, formData.password);
      if (!res.success) {
        setError(res.message);
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Info */}
        <div className="p-8 md:p-12 bg-red-600 text-white flex flex-col justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">CHECK-ICFES</h1>
          <p className="text-red-100 mb-8 text-lg font-bold uppercase tracking-widest text-[12px]">
            Matemáticas Saber 11°
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <BookOpen size={20}/>
              </div>
              <span className="font-bold">Gestión de simulacros y resultados</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <LogIn size={20}/>
              </div>
              <span className="font-bold">Acceso seguro por roles</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <User size={20}/>
              </div>
              <span className="font-bold">Seguimiento personalizado</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <LogIn size={150} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-2">Ingresar</h2>
          <p className="text-slate-500 mb-10 font-bold text-sm">
            Bienvenido de nuevo. Ingresa tus credenciales para acceder a tu panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Correo o Usuario</label>
              <input 
                type="text" required
                placeholder="Ingresa tu usuario"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-red-50 focus:border-red-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
              <input 
                type="password" required
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-red-50 focus:border-red-500 outline-none transition-all placeholder:text-slate-300 font-bold"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black border border-red-100 flex items-center gap-3 uppercase tracking-wider">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all mt-8 shadow-xl shadow-red-500/10 disabled:opacity-70 uppercase tracking-widest text-sm"
            >
              {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              ¿Olvidaste tu contraseña? <span className="text-red-600 font-black cursor-pointer hover:underline">Contacta al Administrador</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
