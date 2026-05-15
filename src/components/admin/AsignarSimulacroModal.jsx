import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Users, School, GraduationCap, CheckCircle2, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function AsignarSimulacroModal({ simulacro, onSave, onCancel }) {
  const { usuarios } = useApp();
  const [tipoAsignacion, setTipoAsignacion] = useState(simulacro.asignadoA?.tipo || 'todos');
  const [institucionSeleccionada, setInstitucionSeleccionada] = useState(simulacro.asignadoA?.institucion || '');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(simulacro.asignadoA?.grupo || '');
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState(simulacro.asignadoA?.estudiantesIds || []);
  const [searchTerm, setSearchTerm] = useState('');

  const estudiantes = useMemo(() => 
    usuarios.filter(u => String(u.rol || "").toLowerCase() === 'estudiante'),
    [usuarios]
  );

  const instituciones = useMemo(() => 
    [...new Set(estudiantes.map(e => e.institucion).filter(Boolean))],
    [estudiantes]
  );

  const grupos = useMemo(() => 
    [...new Set(estudiantes.filter(e => e.institucion === institucionSeleccionada).map(e => e.grupo).filter(Boolean))],
    [estudiantes, institucionSeleccionada]
  );

  const estudiantesFiltrados = useMemo(() => {
    let filtrados = estudiantes;
    if (searchTerm) {
      filtrados = filtrados.filter(e => 
        e.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.codigoEstudiante?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtrados;
  }, [estudiantes, searchTerm]);

  const handleToggleEstudiante = (id) => {
    setEstudiantesSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleGuardar = () => {
    if (!simulacro.preguntasIds || simulacro.preguntasIds.length === 0) {
      alert("El simulacro no tiene preguntas asignadas.");
      return;
    }

    if (tipoAsignacion === 'estudiantes' && estudiantesSeleccionados.length === 0) {
      alert("Seleccione al menos un estudiante.");
      return;
    }

    if (tipoAsignacion === 'grupo' && (!institucionSeleccionada || !grupoSeleccionado)) {
      alert("Seleccione una institución y un grupo.");
      return;
    }

    if (tipoAsignacion === 'institucion' && !institucionSeleccionada) {
      alert("Seleccione una institución.");
      return;
    }

    const data = {
      ...simulacro,
      estado: "publicado",
      visible: true,
      asignadoA: {
        tipo: tipoAsignacion,
        institucion: (tipoAsignacion === 'grupo' || tipoAsignacion === 'institucion') ? institucionSeleccionada : '',
        grupo: tipoAsignacion === 'grupo' ? grupoSeleccionado : '',
        estudiantesIds: tipoAsignacion === 'estudiantes' ? estudiantesSeleccionados : []
      },
      estudiantesAsignados: tipoAsignacion === 'estudiantes' ? estudiantesSeleccionados : [],
      institucion: (tipoAsignacion === 'grupo' || tipoAsignacion === 'institucion') ? institucionSeleccionada : '',
      grupoAsignado: tipoAsignacion === 'grupo' ? grupoSeleccionado : ''
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white text-indigo-600 rounded-2xl shadow-sm">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-900">Asignar Simulacro</h3>
              <p className="text-indigo-700/70 text-[10px] font-black uppercase tracking-widest">{simulacro.nombre}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-indigo-100 rounded-xl transition-all text-indigo-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Tipo de Asignación */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Seleccionar Modalidad de Asignación</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'todos', label: 'Todos', icon: CheckCircle2 },
                { id: 'institucion', label: 'Institución', icon: School },
                { id: 'grupo', label: 'Grupo', icon: GraduationCap },
                { id: 'estudiantes', label: 'Específicos', icon: Users }
              ].map(tipo => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoAsignacion(tipo.id)}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center group
                    ${tipoAsignacion === tipo.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                      : 'border-slate-100 hover:border-indigo-200 text-slate-400'}`}
                >
                  <tipo.icon size={24} className={tipoAsignacion === tipo.id ? 'animate-bounce' : 'group-hover:scale-110 transition-all'} />
                  <span className="text-xs font-black uppercase tracking-widest">{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros Dinámicos */}
          <AnimatePresence mode="wait">
            {(tipoAsignacion === 'institucion' || tipoAsignacion === 'grupo') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institución</label>
                  <select
                    value={institucionSeleccionada}
                    onChange={(e) => { setInstitucionSeleccionada(e.target.value); setGrupoSeleccionado(''); }}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all appearance-none outline-none font-bold text-slate-700"
                  >
                    <option value="">Seleccione Institución</option>
                    {instituciones.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  </select>
                </div>
                {tipoAsignacion === 'grupo' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grupo</label>
                    <select
                      value={grupoSeleccionado}
                      onChange={(e) => setGrupoSeleccionado(e.target.value)}
                      disabled={!institucionSeleccionada}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all appearance-none outline-none font-bold text-slate-700 disabled:opacity-50"
                    >
                      <option value="">Seleccione Grupo</option>
                      {grupos.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </motion.div>
                )}
              </motion.div>
            )}

            {tipoAsignacion === 'estudiantes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                   <h4 className="font-black text-slate-700">Listado de Estudiantes</h4>
                   <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold"
                      />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {estudiantesFiltrados.map(e => (
                    <button
                      key={e.id}
                      onClick={() => handleToggleEstudiante(e.id)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all
                        ${estudiantesSeleccionados.includes(e.id)
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-slate-50 bg-slate-50 hover:border-slate-100'}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                        ${estudiantesSeleccionados.includes(e.id)
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-200 bg-white'}`}>
                        {estudiantesSeleccionados.includes(e.id) && <CheckCircle2 size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${estudiantesSeleccionados.includes(e.id) ? 'text-emerald-900' : 'text-slate-700'}`}>
                          {e.nombreCompleto}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {e.institucion} • {e.grupo}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500">
                    Seleccionados: <span className="text-indigo-600 font-black">{estudiantesSeleccionados.length}</span>
                  </span>
                  <button 
                    onClick={() => setEstudiantesSeleccionados([])}
                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                  >
                    Limpiar Selección
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-400 hover:bg-white transition-all uppercase tracking-widest text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            Guardar Asignación
            <CheckCircle2 size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
