import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ChangePassword() {
  const { user, changePassword, logout } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const rol = String(user?.rol || "").toLowerCase();

  const validatePassword = (pass) => {
    if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(pass)) return "La contraseña debe tener al menos una letra mayúscula.";
    if (!/[0-9]/.test(pass)) return "La contraseña debe tener al menos un número.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const passwordSistema = String(user?.contrasena || user?.password || "").trim();
    if (currentPassword !== passwordSistema) {
      setError('La contraseña actual es incorrecta.');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    changePassword(user.id, newPassword);
    alert('Contraseña actualizada correctamente. Bienvenido a la plataforma.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold">Cambio de Contraseña</h2>
          <p className="opacity-80 mt-2">Por seguridad, debes cambiar tu contraseña temporal en tu primer ingreso.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-shake">
              <AlertCircle size={16} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <div className="relative">
              <input 
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-tight">
              Mínimo 8 caracteres, una mayúscula y un número.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>

          <div className="pt-4 space-y-3">
            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Actualizar Contraseña
            </button>
            <button 
              type="button"
              onClick={logout}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all font-semibold"
            >
              Cancelar y Salir
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
