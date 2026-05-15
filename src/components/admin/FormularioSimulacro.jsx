import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Search, CheckCircle2, ListChecks, Clock, Calendar, Users, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FormularioSimulacro({ simulacro, onSave, onCancel }) {
  const { preguntas, usuarios } = useApp();
  const [activeStep, setActiveStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    preguntasIds: [],
    tiempoMinutos: 60,
    fechaApertura: '',
    fechaCierre: '',
    intentosPermitidos: 1,
    retroalimentacionInmediata: false,
    estado: 'activo',
    grupoAsignado: 'Todos',
    estudiantesAsignados: []
  });

  useEffect(() => {
    if (simulacro) {
      setFormData({
        ...simulacro,
        preguntasIds: [...(simulacro.preguntasIds || [])]
      });
    }
  }, [simulacro]);

  const togglePregunta = (id) => {
    setFormData(prev => {
      const exists = prev.preguntasIds.includes(id);
      if (exists) {
        return { ...prev, preguntasIds: prev.preguntasIds.filter(pid => pid !== id) };
      } else {
        return { ...prev, preguntasIds: [...prev.preguntasIds, id] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.preguntasIds.length === 0) {
      alert('Debe seleccionar al menos una pregunta.');
      return;
    }
    onSave({
      ...formData,
      numeroPreguntas: formData.preguntasIds.length
    });
  };

  const filteredPreguntas = preguntas.filter(p => {
    const noEliminada = p.estado !== 'eliminada';
    const matchesSearch = p.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.competencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.componente?.toLowerCase().includes(searchTerm.toLowerCase());
    return noEliminada && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="bg-slate-900 p-8 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-3xl font-black">{simulacro ? 'Editar Simulacro' : 'Crear Simulacro'}</h2>
            <div className="flex gap-4 mt-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${activeStep === 1 ? 'bg-red-600' : 'bg-white/10'}`}>1. Información General</span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${activeStep === 2 ? 'bg-red-600' : 'bg-white/10'}`}>2. Selección de Preguntas</span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${activeStep === 3 ? 'bg-red-600' : 'bg-white/10'}`}>3. Ajustes de Evaluación</span>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors font-black">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10">
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Simulacro</label>
                <input 
                  required
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-red-500 focus:bg-white outline-none transition-all font-black text-slate-800 placeholder:text-slate-300"
                  placeholder="Ej: Simulacro Matemáticas 01 - Primer Trimestre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-slate-600"
                  placeholder="Explique el propósito o temas que abarca este simulacro..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grupo Asignado</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    value={formData.grupoAsignado}
                    onChange={(e) => setFormData({...formData, grupoAsignado: e.target.value})}
                  >
                    <option value="Todos">Todos los grupos</option>
                    <option value="11-A">11-A</option>
                    <option value="11-B">11-B</option>
                    <option value="11-C">11-C</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Initial</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="activo">Activo (Visible)</option>
                    <option value="inactivo">Inactivo (Proximamente)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between gap-4 sticky top-0 bg-white pb-4 z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Filtrar por enunciado o competencia..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-red-500 focus:bg-white outline-none transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="px-4 py-2 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                   <ListChecks size={20} className="text-red-600" />
                   <span className="text-sm font-black text-red-700">{formData.preguntasIds.length} <span className="text-red-400">Seleccionadas</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[400px] pr-2">
                {filteredPreguntas.map(p => {
                  const isSelected = formData.preguntasIds.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => togglePregunta(p.id)}
                      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 items-center group
                        ${isSelected ? 'bg-red-50/50 border-red-500' : 'bg-white border-slate-50 hover:border-slate-200'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all font-black
                        ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-200 group-hover:bg-slate-100 group-hover:text-slate-400'}`}>
                        {isSelected ? <CheckCircle2 size={16} /> : p.id}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold line-clamp-1 transition-all ${isSelected ? 'text-red-900' : 'text-slate-600'}`}>{p.enunciado}</p>
                        <div className="flex gap-4 mt-1">
                           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{p.competencia}</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${p.dificultad === 'Alta' ? 'text-rose-400' : 'text-emerald-400'}`}>{p.dificultad}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                   <h4 className="font-black text-slate-800 flex items-center gap-2">
                     <Clock size={20} className="text-red-600" />
                     Parámetros de Tiempo
                   </h4>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiempo Límite (Minutos)</label>
                        <input 
                          type="number"
                    className="w-full px-5 py-4 bg-white border-2 border-white rounded-2xl outline-none focus:border-red-500 font-bold"
                    value={formData.tiempoMinutos}
                    onChange={(e) => setFormData({...formData, tiempoMinutos: parseInt(e.target.value)})}
                  />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intentos Permitidos</label>
                        <select 
                    className="w-full px-5 py-4 bg-white border-2 border-white rounded-2xl outline-none focus:border-red-500 font-bold"
                    value={formData.intentosPermitidos}
                    onChange={(e) => setFormData({...formData, intentosPermitidos: parseInt(e.target.value)})}
                  >
                          <option value={1}>1 Intento</option>
                          <option value={2}>2 Intentos</option>
                          <option value={0}>Ilimitados</option>
                        </select>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                   <h4 className="font-black text-slate-800 flex items-center gap-2">
                     <Calendar size={20} className="text-red-600" />
                     Disponibilidad
                   </h4>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Apertura</label>
                        <input 
                          type="date"
                    className="w-full px-5 py-4 bg-white border-2 border-white rounded-2xl outline-none focus:border-red-500 font-bold"
                    value={formData.fechaApertura}
                    onChange={(e) => setFormData({...formData, fechaApertura: e.target.value})}
                  />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Cierre</label>
                        <input 
                          type="date"
                    className="w-full px-5 py-4 bg-white border-2 border-white rounded-2xl outline-none focus:border-red-500 font-bold"
                    value={formData.fechaCierre}
                    onChange={(e) => setFormData({...formData, fechaCierre: e.target.value})}
                  />
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
                      <Info size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-red-900 uppercase text-xs tracking-widest">Retroalimentación Instantánea</h4>
                      <p className="text-sm font-bold text-red-700/60">Mostrar resultados pregunta a pregunta durante el examen</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.retroalimentacionInmediata}
                      onChange={(e) => setFormData({...formData, retroalimentacionInmediata: e.target.checked})}
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50 flex gap-4">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-8 py-5 border-2 border-slate-100 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
              >
                Anterior
              </button>
            )}
            
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-sm"
              >
                Siguiente Paso
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 px-8 py-5 bg-red-600 text-white rounded-[2rem] font-black hover:bg-red-700 transition-all shadow-xl shadow-red-500/10 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                <Save size={20} />
                Guardar Simulacro
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
