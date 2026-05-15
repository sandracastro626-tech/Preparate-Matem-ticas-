import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, ListChecks, Calendar, Clock, Users, Edit2, Trash2, Eye, ShieldAlert, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FormularioSimulacro from './FormularioSimulacro';
import AsignarSimulacroModal from './AsignarSimulacroModal';

export default function GestionSimulacros() {
  const { user, simulacros, deleteSimulacro, addSimulacro, updateSimulacro } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingSimulacro, setEditingSimulacro] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);

  const simulacrosVisibles = simulacros.filter(s => {
    const estado = String(s.estado || "activo").toLowerCase();
    return estado !== 'eliminado';
  });

  const getTextoAsignacion = (s) => {
    const tipo = s.asignadoA?.tipo;
    if (tipo === 'estudiantes') return `${s.asignadoA.estudiantesIds?.length || 0} estudiantes`;
    if (tipo === 'grupo') return `Grupo ${s.asignadoA.grupo} - ${s.asignadoA.institucion}`;
    if (tipo === 'institucion') return `Institución ${s.asignadoA.institucion}`;
    if (tipo === 'todos') return "Todos los estudiantes";
    return s.grupoAsignado || "Sin asignar";
  };

  const handleSaveAssignment = (data) => {
    updateSimulacro(data);
    setShowAssignModal(null);
  };

  const handleDelete = (id) => {
    deleteSimulacro(id);
    setShowDeleteConfirm(null);
  };

  const handleSave = (data) => {
    if (editingSimulacro) {
      updateSimulacro({ ...editingSimulacro, ...data, fechaActualizacion: new Date().toISOString() });
    } else {
      addSimulacro({
        ...data,
        id: `sim_admin_${Date.now()}`,
        creadoPor: user?.id || 'admin',
        autorNombre: user?.nombreCompleto || 'Administrador',
        autorRol: 'administrador',
        origen: 'administrador',
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Control de Simulacros</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Configuración de evaluaciones Saber 11°</p>
        </div>
        <button 
          onClick={() => { setEditingSimulacro(null); setShowForm(true); }}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest text-sm"
        >
          <Plus size={20} />
          Crear Simulacro
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {simulacrosVisibles.length > 0 ? (
          simulacrosVisibles.map(s => (
            <motion.div 
              key={s.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col"
            >
              <div className={`p-8 ${s.estado === 'activo' ? 'bg-indigo-600' : 'bg-slate-400'} text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {s.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
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
                      {s.numeroPreguntas || s.preguntasIds?.length || 0}
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
                      <span className="text-xs font-bold text-slate-500">Apertura: {s.fechaApertura || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Asignado a: {getTextoAsignacion(s)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => handleEdit(s)}
                  className="flex-1 p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
                <button 
                  onClick={() => setShowAssignModal(s)}
                  className="flex-1 p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <Share2 size={16} />
                  Asignar
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(s)}
                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <ListChecks size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest">No hay simulacros creados</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <FormularioSimulacro 
            simulacro={editingSimulacro}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingSimulacro(null); }}
          />
        )}

        {showAssignModal && (
          <AsignarSimulacroModal 
            simulacro={showAssignModal}
            onSave={handleSaveAssignment}
            onCancel={() => setShowAssignModal(null)}
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
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar simulacro?</h3>
                <p className="text-slate-500 font-medium mb-6">Esta acción no se puede deshacer. Los resultados asociados podrán verse afectados.</p>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left mb-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre del Simulacro</p>
                   <p className="text-sm font-bold text-slate-700 italic">"{showDeleteConfirm.nombre}"</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDelete(showDeleteConfirm.id)}
                    className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 uppercase tracking-widest text-sm"
                  >
                    Eliminar
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
