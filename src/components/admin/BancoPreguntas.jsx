import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Edit2, Trash2, Book, AlertCircle, Filter, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FormularioPregunta from './FormularioPregunta';

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

export default function BancoPreguntas() {
  const { preguntas, deletePregunta, addPregunta, updatePregunta, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filterCompetencia, setFilterCompetencia] = useState('TODOS');
  const [filterDificultad, setFilterDificultad] = useState('TODOS');

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
    const matchesSearch = p.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.componente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.autorNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompetencia = filterCompetencia === 'TODOS' || p.competencia === filterCompetencia;
    const matchesDificultad = filterDificultad === 'TODOS' || p.dificultad === filterDificultad;
    return noEliminada && matchesSearch && matchesCompetencia && matchesDificultad;
  });

  const handleEdit = (p) => {
    setEditingPregunta(p);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deletePregunta(id);
    setShowDeleteConfirm(null);
  };

  const handleSave = (data) => {
    if (editingPregunta) {
      updatePregunta({ ...editingPregunta, ...data });
    } else {
      addPregunta({
        ...data,
        creadoPor: 'admin',
        fechaCreacion: new Date().toISOString()
      });
    }
    setShowForm(false);
    setEditingPregunta(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total banco" 
          value={preguntas.filter(p => !p.estado || p.estado !== 'eliminada').length} 
          icon={Book} 
          color="text-indigo-600" 
          bg="bg-indigo-50" 
        />
        <StatsCard 
          label="Interpretación" 
          value={preguntas.filter(p => p.estado !== 'eliminada' && String(p.competencia || "").toLowerCase().includes("interpretación")).length} 
          icon={AlertCircle} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatsCard 
          label="Formulación" 
          value={preguntas.filter(p => p.estado !== 'eliminada' && String(p.competencia || "").toLowerCase().includes("formulación")).length} 
          icon={AlertCircle} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatsCard 
          label="Argumentación" 
          value={preguntas.filter(p => p.estado !== 'eliminada' && String(p.competencia || "").toLowerCase().includes("argumentación")).length} 
          icon={AlertCircle} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por enunciado o componente..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50 outline-none focus:border-indigo-500 font-bold text-sm text-slate-600"
            value={filterCompetencia}
            onChange={(e) => setFilterCompetencia(e.target.value)}
          >
            <option value="TODOS">Todas las competencias</option>
            <option value="Interpretación y representación">Interpretación</option>
            <option value="Formulación y ejecución">Formulación</option>
            <option value="Argumentación">Argumentación</option>
          </select>
          <select 
            className="px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50 outline-none focus:border-indigo-500 font-bold text-sm text-slate-600"
            value={filterDificultad}
            onChange={(e) => setFilterDificultad(e.target.value)}
          >
            <option value="TODOS">Todas las dificultades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
          <button 
            onClick={() => { setEditingPregunta(null); setShowForm(true); }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Pregunta
          </button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pregunta / Enunciado</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Autor</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Competencia</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dificultad</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPreguntas.length > 0 ? (
                filteredPreguntas.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-xs">
                          {p.id}
                        </div>
                        <div className="max-w-md">
                          <p className="text-slate-700 font-bold leading-relaxed line-clamp-2">{p.enunciado}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{p.componente || 'Matemáticas'}</p>
                            {p.imagen && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                                <ImageIcon size={10} /> Con imagen
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{p.autorNombre || (p.creadoPor === 'admin' ? 'Administrador' : 'Docente')}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${p.creadoPor === 'admin' ? 'text-indigo-500' : 'text-amber-500'}`}>
                          {p.creadoPor === 'admin' ? 'Oficial' : 'Externo'}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-600">{p.competencia}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${p.dificultad === 'Alta' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          p.dificultad === 'Media' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {p.dificultad}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(p)}
                          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Book size={48} />
                      <p className="font-black uppercase tracking-widest">No se encontraron preguntas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <FormularioPregunta 
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
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar pregunta?</h3>
                <p className="text-slate-500 font-medium mb-6">Esta acción es irreversible y afectará a los simulacros que contengan esta pregunta.</p>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left mb-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enunciado</p>
                   <p className="text-sm font-bold text-slate-700 line-clamp-3 italic">"{showDeleteConfirm.enunciado}"</p>
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
