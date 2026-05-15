import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, AlertCircle, Save, ShieldAlert } from 'lucide-react';

export default function ModalCambiarContrasena({ usuario, onSave, onCancel }) {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');

  const handleGuardar = (e) => {
    e.preventDefault();
    setError('');

    if (!nuevaContrasena) {
      setError('La contraseña no puede estar vacía.');
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    onSave(usuario.id, nuevaContrasena);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Key className="text-indigo-400" size={28} />
              </div>
              <button 
                onClick={onCancel}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="text-2xl font-black mb-1">Cambiar Contraseña</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Seguridad de Usuario</p>
          </div>
          <Key className="absolute -bottom-10 -right-10 text-white/5" size={180} />
        </div>

        <form onSubmit={handleGuardar} className="p-8 space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario Seleccionado</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                ${usuario.rol === 'administrador' ? 'bg-purple-100 text-purple-600' : 
                  usuario.rol === 'docente' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                {usuario.rol}
              </span>
            </div>
            <p className="font-black text-slate-800">{usuario.nombreCompleto}</p>
            <p className="text-xs text-slate-400 font-medium">{usuario.usuario || usuario.email}</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
            >
              <AlertCircle size={18} />
              <p className="text-xs font-bold">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                placeholder="Mínimo 8 caracteres"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                placeholder="Repita la contraseña"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3 text-sm">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
          
          <div className="flex items-center gap-2 justify-center text-slate-300">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Acción exclusiva de administrador</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
