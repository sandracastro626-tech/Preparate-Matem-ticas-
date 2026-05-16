import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, User, GraduationCap, ArrowRight, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle, registerUser } = useApp();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const res = await login(formData.email, formData.password);
      if (!res.success) {
        setError(res.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intente de nuevo.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setError("Error con Google login: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await registerUser({
        nombreCompleto: "Sandra Castro",
        usuario: "sandra",
        email: "sandraandersoncy@gmail.com",
        contrasena: "Admin123*",
        rol: "administrador",
        estado: "activo"
      });
      if (res.success) {
        setSuccess("Administrador creado: sandraandersoncy@gmail.com. Ahora puedes iniciar sesión con la contraseña Admin123*");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Error al inicializar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Info */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex flex-col justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">CHECK-ICFES</h1>
          <p className="text-blue-100 mb-8 text-lg font-bold uppercase tracking-widest text-[12px]">
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
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 font-bold"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
              <input 
                type="password" required
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 font-bold"
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

            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-[11px] font-black border border-emerald-100 flex items-center gap-3 uppercase tracking-wider">
                <CheckCircle2 size={18} />
                {success}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all mt-8 shadow-xl shadow-blue-500/10 disabled:opacity-70 uppercase tracking-widest text-sm"
            >
              {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-slate-400">O ingresa con</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-5 bg-white border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 text-slate-700 rounded-2xl font-black flex items-center justify-center gap-4 transition-all disabled:opacity-70 uppercase tracking-widest text-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Continuar con Google
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
             <button 
              type="button"
              onClick={handleSeedAdmin}
              disabled={isLoading}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline disabled:opacity-50"
            >
              Inicializar Administrador (Prueba)
            </button>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              ¿Olvidaste tu contraseña? <span className="text-blue-700 font-black cursor-pointer hover:underline">Contacta al Administrador</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
