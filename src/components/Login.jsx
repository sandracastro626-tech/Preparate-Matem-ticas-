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
      console.log("=== INICIANDO LOGIN EN LOGIN.JSX ===");
      const res = login(formData.email, formData.password);
      if (!res.success) {
        console.error("Error en login:", res.message);
        setError(res.message);
        setIsLoading(false);
      } else {
        console.log("Login exitoso:", res.user);
      }
    }, 500);
  };

  const verUsuarios = () => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    console.log("=== USUARIOS EN LOCALSTORAGE ===");
    console.table(usuarios);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Info */}
        <div className="p-8 md:p-12 bg-indigo-700 text-white flex flex-col justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Check ICFES</h1>
          <p className="text-indigo-100 mb-8 text-lg font-medium">
            Matemáticas Saber 11° Pro
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <BookOpen size={20}/>
              </div>
              <span className="font-medium">Gestión de simulacros y resultados</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <LogIn size={20}/>
              </div>
              <span className="font-medium">Acceso seguro por roles</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <User size={20}/>
              </div>
              <span className="font-medium">Seguimiento personalizado</span>
            </div>
          </div>
          
          <div className="mt-12 space-y-3">
            <div className="p-3 bg-indigo-800/50 rounded-xl border border-indigo-500/30">
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest mb-1">Admin</p>
              <p className="text-xs font-mono text-white/90">admin / Admin123*</p>
            </div>
            <div className="p-3 bg-indigo-800/50 rounded-xl border border-indigo-500/30">
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest mb-1">Docente</p>
              <p className="text-xs font-mono text-white/90">docente / Docente123*</p>
            </div>
            <div className="p-3 bg-indigo-800/50 rounded-xl border border-indigo-500/30">
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest mb-1">Estudiante</p>
              <p className="text-xs font-mono text-white/90">estudiante / Estudiante123*</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={verUsuarios}
            className="mt-6 w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Ver usuarios guardados (Consola)
          </button>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <LogIn size={150} />
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Ingresar</h2>
          <p className="text-slate-500 mb-10 font-medium">
            Ingresa a tu panel con tus credenciales asignadas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Correo o Usuario</label>
              <input 
                type="text" required
                placeholder="ejemplo@checkicfes.com"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
              <input 
                type="password" required
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mt-8 shadow-xl shadow-indigo-100 disabled:opacity-70"
            >
              {isLoading ? 'Verificando...' : 'Entrar a la plataforma'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              ¿Olvidaste tu contraseña? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Contacta a tu administrador</span>
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
