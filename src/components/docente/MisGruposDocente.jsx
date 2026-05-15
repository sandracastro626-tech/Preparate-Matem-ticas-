import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { obtenerEstudiantesDelDocente } from '../../utils/docenteUtils';
import { LayoutGrid, Building2, Users, TrendingUp, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnalisisEstudiante from './AnalisisEstudiante';

export default function MisGruposDocente() {
  const { usuarios, intentos, user } = useApp();
  const [selectedInstitution, setSelectedInstitution] = useState('Todas');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [viewingStudent, setViewingStudent] = useState(null);

  const misEstudiantes = obtenerEstudiantesDelDocente(usuarios, user);
  
  const instituciones = useMemo(() => {
    return ['Todas', ...new Set(misEstudiantes.map(e => e.institucion).filter(Boolean))];
  }, [misEstudiantes]);

  const grupos = useMemo(() => {
    let filtered = misEstudiantes;
    if (selectedInstitution !== 'Todas') {
      filtered = filtered.filter(e => e.institucion === selectedInstitution);
    }
    return ['Todos', ...new Set(filtered.map(e => e.grupo).filter(Boolean))];
  }, [misEstudiantes, selectedInstitution]);

  const estudiantesFiltrados = useMemo(() => {
    return misEstudiantes.filter(e => {
      const matchInst = selectedInstitution === 'Todas' || e.institucion === selectedInstitution;
      const matchGroup = selectedGroup === 'Todos' || e.grupo === selectedGroup;
      return matchInst && matchGroup;
    });
  }, [misEstudiantes, selectedInstitution, selectedGroup]);

  const stats = useMemo(() => {
    if (estudiantesFiltrados.length === 0) return { avg: 0, critical: 0 };
    const misIds = estudiantesFiltrados.map(e => e.id);
    const misIntentos = intentos.filter(i => misIds.includes(i.estudianteId));
    
    const avg = misIntentos.length > 0 
      ? Math.round(misIntentos.reduce((a, b) => a + (b.resultados?.puntajeGlobal || 0), 0) / misIntentos.length)
      : 0;

    const critical = estudiantesFiltrados.filter(e => {
      const studentIntentos = misIntentos.filter(i => i.estudianteId === e.id);
      if (studentIntentos.length === 0) return false;
      const latest = studentIntentos[studentIntentos.length - 1];
      return (latest.resultados?.puntajeGlobal || 0) < 40;
    }).length;

    return { avg, critical, total: estudiantesFiltrados.length };
  }, [estudiantesFiltrados, intentos]);

  if (viewingStudent) {
    return <AnalisisEstudiante estudiante={viewingStudent} intentos={intentos} onBack={() => setViewingStudent(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Building2 size={12} /> Institución
          </label>
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
            value={selectedInstitution}
            onChange={(e) => { setSelectedInstitution(e.target.value); setSelectedGroup('Todos'); }}
          >
            {instituciones.map(inst => <option key={inst} value={inst}>{inst}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <LayoutGrid size={12} /> Grupo
          </label>
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Total Estudiantes" value={stats.total} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
        <StatsCard label="Promedio General" value={`${stats.avg}%`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatsCard label="Nivel Crítico" value={stats.critical} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden pb-10">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Seguimiento por {selectedGroup === 'Todos' ? 'Institución' : 'Grupo'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nombre</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grupo</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Puntaje Reciente</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Nivel</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {estudiantesFiltrados.map(e => {
                const studentIntentos = intentos.filter(i => i.estudianteId === e.id);
                const latest = studentIntentos.length > 0 ? studentIntentos[studentIntentos.length - 1] : null;
                const score = latest?.resultados?.puntajeGlobal || 0;
                
                return (
                  <tr key={e.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {e.nombreCompleto?.charAt(0)}
                        </div>
                        <span className="text-sm font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">{e.nombreCompleto}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-slate-500">{e.grupo}</td>
                    <td className="p-6">
                      <span className={`text-sm font-black ${score >= 60 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : score > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                        {score > 0 ? `${score}%` : 'S/P'}
                      </span>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest 
                         ${score >= 80 ? 'bg-emerald-50 text-emerald-600' : score >= 60 ? 'bg-indigo-50 text-indigo-600' : score >= 40 ? 'bg-amber-50 text-amber-600' : score > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                         {score >= 80 ? 'Avanzado' : score >= 60 ? 'Satisfactorio' : score >= 40 ? 'Mínimo' : score > 0 ? 'Insuficiente' : 'Pendiente'}
                       </span>
                    </td>
                    <td className="p-6 text-right">
                       <button 
                         onClick={() => setViewingStudent(e)}
                         className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                       >
                         <ChevronRight size={18} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {estudiantesFiltrados.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">
               No hay estudiantes en este grupo/institución
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
      <div>
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
    </div>
  );
}
