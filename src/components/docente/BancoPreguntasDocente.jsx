import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { guardarPreguntaGlobal } from '../../utils/storageGlobal';
import { Plus, Search, Edit2, Trash2, BookOpen, AlertCircle, ShieldAlert, CheckCircle2, Image as ImageIcon, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FormularioPreguntaDocente from './FormularioPreguntaDocente';

function StatsCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function BancoPreguntasDocente() {
  const { preguntas, deletePregunta, addPregunta, updatePregunta, user, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  React.useEffect(() => {
    window.addEventListener("preguntasActualizadas", refreshData);
    window.addEventListener("datosGlobalesActualizados", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("preguntasActualizadas", refreshData);
      window.removeEventListener("datosGlobalesActualizados", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, [refreshData]);

  const filteredPreguntas = preguntas.filter(p => {
    const estado = String(p.estado || "activa").toLowerCase();
    const noEliminada = estado !== "eliminada";
    const activa = estado === 'activa' || estado === 'activo' || estado === 'publicada' || estado === 'publicado' || !p.estado;
    const compartida = p.visibilidad === 'compartida' || 
                      p.visiblePara?.includes('docente') || 
                      p.autorRol === 'administrador' || 
                      p.autorRol === 'docente' ||
                      p.origen === 'administrador' ||
                      p.origen === 'docente' ||
                      p.creadoPor === user.id;

    const matchesSearch = p.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.competencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.autorNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return noEliminada && activa && compartida && matchesSearch;
  });

  const handleSave = (data) => {
    guardarPreguntaGlobal({
      ...data,
      id: editingPregunta?.id
    });
    setShowForm(false);
    setEditingPregunta(null);
  };

  const handleEdit = (p) => {
    setEditingPregunta(p);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deletePregunta(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total banco" 
          value={preguntas.filter(p => p.estado !== 'eliminada').length} 
          icon={Book} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatsCard 
          label="Interpretación" 
          value={preguntas.filter(p => p.estado !== 'eliminada' && String(p.competencia || "").toLowerCase().includes("interpretación")).length} 
          icon={CheckCircle2} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatsCard 
          label="Formulación" 
          value={preguntas.filter(p => p.estado !== 'eliminada' && String(p.competencia || "").toLowerCase().includes("formulación")).length} 
          icon={CheckCircle2} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatsCard 
          label="Argumentación" 
          value={preguntas.filter(p => p.estado !== 'eliminada' && String(p.competencia || "").toLowerCase().includes("argumentación")).length} 
          icon={CheckCircle2} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Banco de Preguntas</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Saber 11° - Matemáticas</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Buscar ítems..." 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button 
            onClick={() => { setEditingPregunta(null); setShowForm(true); }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            <Plus size={18} />
            Nueva Pregunta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredPreguntas.length > 0 ? (
          filteredPreguntas.map(p => (
            <motion.div 
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col group p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit
                    ${p.dificultad === 'Alta' ? 'bg-rose-50 text-rose-600' : p.dificultad === 'Media' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {p.dificultad}
                  </span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit
                      ${p.creadoPor === user.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.creadoPor === user.id ? 'Personal' : 'Oficial'}
                    </span>
                    <span className="text-[8px] font-black text-slate-400 truncate max-w-[100px]">
                      {p.autorNombre || (p.creadoPor === 'admin' ? 'Admin' : 'Docente')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.imagen && (
                    <span className="flex items-center gap-1 text-[8px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ImageIcon size={10} /> Imagen
                    </span>
                  )}
                  <span className="text-[10px] font-black text-slate-300">ID: {p.id}</span>
                </div>
              </div>
              
              <p className="text-sm font-bold text-slate-700 mb-6 flex-1 line-clamp-4 leading-relaxed group-hover:text-indigo-600 transition-colors">
                {p.enunciado}
              </p>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Competencia</p>
                  <p className="text-xs font-black text-slate-600">{p.competencia}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {p.respuestaCorrecta}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Correcta</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    {(p.creadoPor === user.id || p.origen === 'docente') && (
                      <button 
                        onClick={() => setShowDeleteConfirm(p)}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <BookOpen size={64} className="mx-auto text-slate-100 mb-6" />
            <p className="text-slate-300 font-black uppercase text-xl tracking-widest">No se encontraron preguntas</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <FormularioPreguntaDocente 
            pregunta={editingPregunta}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingPregunta(null); }}
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-10"
            >
              <div className="text-center">
                 <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar Pregunta?</h3>
                 <p className="text-slate-500 font-medium mb-8">Esta acción eliminará el ítem permanentemente del banco.</p>
                 <div className="flex gap-4">
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
                    <button onClick={() => handleDelete(showDeleteConfirm.id)} className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100 uppercase tracking-widest text-xs">Eliminar</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
