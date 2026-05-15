import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { limpiarDatosDePrueba } from '../../utils/storageGlobal';
import { AlertTriangle, Trash2, ShieldAlert, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ReinicioPlataforma() {
  const { user } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (user?.rol !== 'administrador') return null;

  const handleReset = () => {
    if (confirmText === 'ESCRIBO LIMPIAR DATOS') {
      limpiarDatosDePrueba();
      setIsSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Trash2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Reinicio de Plataforma</h2>
            <p className="text-slate-500 text-sm">Gestiona la limpieza de datos de prueba para iniciar el uso real.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl mb-8">
          <div className="flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Advertencia Crítica</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                Esta acción eliminará <strong>todos los datos de prueba</strong> almacenados en la plataforma. 
                Se eliminarán usuarios (docentes y estudiantes), preguntas, simulacros, resultados, reportes, 
                notificaciones, observaciones y asignaciones.
              </p>
              <p className="text-amber-800 text-sm mt-4 font-bold">
                Solo se conservará la cuenta del administrador principal. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>

        {!isSuccess ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 group"
          >
            <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
            Limpiar datos de prueba
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-emerald-600 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check size={32} />
            </div>
            <p className="font-bold text-xl uppercase tracking-tighter">¡Plataforma Reiniciada!</p>
            <p className="text-slate-500">Reiniciando sistema para aplicar cambios...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-rose-50 flex items-center gap-4">
                <div className="p-3 bg-white text-rose-600 rounded-2xl shadow-sm">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-900">Confirmación Final</h3>
                  <p className="text-rose-700/70 text-sm">Esta es una acción irreversible.</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Para proceder con la limpieza total de la plataforma, por favor escribe la siguiente frase exactamente como aparece abajo:
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-center font-mono text-slate-800 font-bold tracking-widest bg-stripes-slate">
                  ESCRIBO LIMPIAR DATOS
                </div>

                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Escribe la frase de confirmación aquí..."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-rose-500 focus:outline-none transition-all font-bold text-center uppercase tracking-widest text-slate-700"
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmText('');
                    }}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={confirmText !== 'ESCRIBO LIMPIAR DATOS'}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                      confirmText === 'ESCRIBO LIMPIAR DATOS'
                        ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Limpiar datos
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
