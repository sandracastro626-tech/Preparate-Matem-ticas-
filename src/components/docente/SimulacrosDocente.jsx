import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, ListChecks, Calendar, Clock, Users, Edit2, Trash2, Eye, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FormularioSimulacroDocente from './FormularioSimulacroDocente';

export default function SimulacrosDocente() {
  const { simulacros, deleteSimulacro, addSimulacro, updateSimulacro, user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingSimulacro, setEditingSimulacro] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const { refreshData } = useApp();

  React.useEffect(() => {
    window.addEventListener("simulacrosActualizados", refreshData);
    window.addEventListener("datosGlobalesActualizados", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("simulacrosActualizados", refreshData);
      window.removeEventListener("datosGlobalesActualizados", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, [refreshData]);

  // Filtrar simulacros globales, del admin o propios
  const misSimulacros = simulacros.filter(s => {
    const estado = String(s.estado || "publicado").toLowerCase();
    if (estado === 'eliminado') return false;

    return (
      s.visibilidad === "global" || 
      s.visible === true || 
      s.compartidoCon?.includes("docente") ||
      s.creadoPor === user.id ||
      s.autorRol === "administrador" ||
      s.autorRol === "docente"
    );
  });

  const handleDelete = (id) => {
    deleteSimulacro(id);
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (s) => {
    const copia = {
      ...s,
      id: `SIM_COPY_${Date.now()}`,
      nombre: `${s.nombre || s.titulo} - Copia`,
      titulo: `${s.titulo || s.nombre} - Copia`,
      creadoPor: user.id,
      autorNombre: user.nombreCompleto,
      autorRol: user.rol,
      origen: user.rol,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      estado: 'borrador' // Duplicados empiezan como borrador para que el docente los revise
    };
    addSimulacro(copia);
  };

  const handleSave = (data) => {
    if (editingSimulacro) {
      updateSimulacro({ ...editingSimulacro, ...data, fechaActualizacion: new Date().toISOString() });
    } else {
      addSimulacro({
        ...data,
        id: `sim_${Date.now()}`,
        creadoPor: user.id,
        autorNombre: user.nombreCompleto,
        origen: 'docente',
        fechaCreacion: new Date().toISOString()
      });
    }
    setShowForm(false);
    setEditingSimulacro(null);
  };

  const handleEdit = (s) => {
    setEditingSimulacro(s);
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mis Simulacros</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Gestión de pruebas para mis grupos</p>
        </div>
        <button 
          onClick={() => { setEditingSimulacro(null); setShowForm(true); }}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest text-sm"
        >
          <Plus size={20} />
          Nuevo Simulacro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {misSimulacros.length > 0 ? (
          misSimulacros.map(s => (
            <motion.div 
              key={s.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col group"
            >
              <div className={`p-8 ${s.estado === 'activo' ? 'bg-indigo-600' : 'bg-slate-400'} text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {s.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                      ${s.estado === 'activo' ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white border border-white/30'}`}>
                      {s.estado}
                    </span>
                  </div>
                  <h3 className="text-xl font-black mb-2 line-clamp-1">{s.nombre}</h3>
                  <p className="text-white/70 text-xs font-medium line-clamp-2">{s.descripcion}</p>
                </div>
                <ListChecks className="absolute -bottom-10 -right-10 text-white/5" size={150} />
              </div>

              <div className="p-8 flex-1 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preguntas</span>
                    <div className="flex items-center gap-2 text-slate-700 font-black">
                      <ListChecks size={16} className="text-indigo-600" />
                      {s.preguntasIds?.length || s.numeroPreguntas || 0}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiempo</span>
                    <div className="flex items-center gap-2 text-slate-700 font-black">
                      <Clock size={16} className="text-indigo-600" />
                      {s.tiempoMinutos || 60} min
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Cierre: {s.fechaCierre || 'Sin fecha'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Asignado: {s.grupoAsignado || 'Todos'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => handleEdit(s)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
                <button 
                  onClick={() => handleDuplicate(s)}
                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                  title="Duplicar Simulacro"
                >
                  <Copy size={16} />
                </button>
                {s.creadoPor === user.id && (
                  <button 
                    onClick={() => setShowDeleteConfirm(s)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <ListChecks size={64} className="mx-auto text-slate-100 mb-6" />
            <p className="text-slate-300 font-black uppercase text-xl tracking-widest">No hay simulacros creados</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <FormularioSimulacroDocente 
            simulacro={editingSimulacro}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingSimulacro(null); }}
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar simulacro?</h3>
                <p className="text-slate-500 font-medium mb-8">Esta acción no se puede deshacer. Se perderán los registros de avance.</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDelete(showDeleteConfirm.id)}
                    className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 uppercase tracking-widest text-xs"
                  >
                    Confirmar
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
