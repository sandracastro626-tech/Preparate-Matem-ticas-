import React from 'react';
import { motion } from 'motion/react';
import { 
  FileSearch, Calendar, Trophy, ChevronRight, 
  Target, AlertCircle, CheckCircle2, History
} from 'lucide-react';

export default function MisResultadosEstudiante({ resultados, onVerDetalle }) {
  if (!resultados || resultados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
        <History size={64} className="text-slate-200 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 mb-2">Aún no has realizado simulacros</h3>
        <p className="text-slate-500 font-medium">Ingresa a Mis Simulacros para comenzar tu entrenamiento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-800">Historial de Intentos</h3>
        <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest">
          {resultados.length} Intentos registrados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resultados.map((resultado, index) => (
          <TarjetaResultado 
            key={resultado.id || index} 
            resultado={resultado} 
            onClick={() => onVerDetalle(resultado)} 
          />
        ))}
      </div>
    </div>
  );
}

function TarjetaResultado({ resultado, onClick }) {
  const { simulacroNombre, fecha, puntajeGlobal, correctas, incorrectas, nivel } = resultado;
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
          <Calendar size={24} />
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${nivel?.bg || 'bg-slate-100'} ${nivel?.color || 'text-slate-600'}`}>
          {nivel?.label || 'Completado'}
        </div>
      </div>

      <div className="flex-1">
        <h4 className="font-black text-slate-800 text-lg mb-1 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
          {simulacroNombre}
        </h4>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
          Presentado el {new Date(fecha).toLocaleDateString()}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Puntaje</p>
            <p className="text-2xl font-black text-indigo-600">{puntajeGlobal}<span className="text-xs text-slate-300 ml-1">/100</span></p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correctas</p>
            <p className="text-2xl font-black text-emerald-500">{correctas}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onClick}
        className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-100 hover:shadow-rose-200"
      >
        VER DETALLE COMPLETO <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}
