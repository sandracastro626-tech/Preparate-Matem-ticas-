import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { obtenerEstudiantesDelDocente } from '../../utils/docenteUtils';
import { BarChart3, TrendingUp, Users, LayoutGrid, Building2, Search, Download, Eye, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BarDesempeño, RadarDesempeño } from '../Charts';
import AnalisisEstudiante from './AnalisisEstudiante';

export default function ResultadosDocente() {
  const { usuarios, intentos, user } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('individual');
  const [selectedInstitution, setSelectedInstitution] = useState('Todas');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [viewingStudent, setViewingStudent] = useState(null);

  const misEstudiantes = obtenerEstudiantesDelDocente(usuarios, user);
  const misIds = misEstudiantes.map(e => e.id);
  const misIntentos = intentos.filter(i => misIds.includes(i.estudianteId));

  const instituciones = ['Todas', ...new Set(misEstudiantes.map(e => e.institucion).filter(Boolean))];
  const grupos = ['Todos', ...new Set(misEstudiantes.filter(e => selectedInstitution === 'Todas' || e.institucion === selectedInstitution).map(e => e.grupo).filter(Boolean))];

  const filteredEstudiantes = misEstudiantes.filter(e => {
    const matchInst = selectedInstitution === 'Todas' || e.institucion === selectedInstitution;
    const matchGroup = selectedGroup === 'Todos' || e.grupo === selectedGroup;
    return matchInst && matchGroup;
  });

  const aggregateStats = useMemo(() => {
    const ids = filteredEstudiantes.map(e => e.id);
    const currents = misIntentos.filter(i => ids.includes(i.estudianteId));
    
    if (currents.length === 0) return { avg: 0, top: 0, low: 0 };

    const avg = Math.round(currents.reduce((a, b) => a + (b.resultados?.puntajeGlobal || 0), 0) / currents.length);
    const scores = currents.map(i => i.resultados?.puntajeGlobal || 0);
    
    return {
      avg,
      top: Math.max(...scores),
      low: Math.min(...scores),
      count: currents.length
    };
  }, [filteredEstudiantes, misIntentos]);

  if (viewingStudent) {
    return <AnalisisEstudiante estudiante={viewingStudent} intentos={intentos} onBack={() => setViewingStudent(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm gap-2 max-w-fit">
        <button 
          onClick={() => setActiveSubTab('individual')}
          className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'individual' ? 'bg-slate-900 text-white shadow-xl shadow-slate-100' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Individual
        </button>
        <button 
          onClick={() => setActiveSubTab('grupal')}
          className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'grupal' ? 'bg-slate-900 text-white shadow-xl shadow-slate-100' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Grupal
        </button>
        <button 
          onClick={() => setActiveSubTab('institucional')}
          className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'institucional' ? 'bg-slate-900 text-white shadow-xl shadow-slate-100' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Institucional
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institución</label>
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold"
            value={selectedInstitution}
            onChange={(e) => { setSelectedInstitution(e.target.value); setSelectedGroup('Todos'); }}
          >
            {instituciones.map(inst => <option key={inst} value={inst}>{inst}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grupo</label>
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MiniMetric label="Total Intentos" value={aggregateStats.count || 0} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
        <MiniMetric label="Promedio" value={`${aggregateStats.avg}%`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <MiniMetric label="Puntaje Máx" value={`${aggregateStats.top}%`} icon={Award} color="text-amber-600" bg="bg-amber-50" />
        <MiniMetric label="Puntaje Mín" value={`${aggregateStats.low}%`} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {activeSubTab === 'individual' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden pb-10">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Resultados Individuales</h3>
             <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
               <Download size={14} /> Exportar
             </button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                 <tr>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grupo</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Puntaje</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredEstudiantes.map(e => {
                   const sIntentos = misIntentos.filter(i => i.estudianteId === e.id);
                   const latest = sIntentos[sIntentos.length - 1];
                   return (
                     <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="p-6 font-bold text-slate-700">{e.nombreCompleto}</td>
                       <td className="p-6 text-sm font-bold text-slate-400">{e.grupo}</td>
                       <td className="p-6 font-black text-slate-800">{latest?.resultados?.puntajeGlobal || 0}%</td>
                       <td className="p-6">
                         <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${latest ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                           {latest ? 'Presentado' : 'Pendiente'}
                         </span>
                       </td>
                       <td className="p-6 text-right">
                         <button onClick={() => setViewingStudent(e)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                            <ChevronRight size={18} />
                         </button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10">Desempeño por Competencias {activeSubTab === 'grupal' ? '(Grupo)' : '(Institución)'}</h3>
              <div className="h-[350px]">
                 <RadarDesempeño data={[
                   { subject: 'Interpretación', value: 65, fullMark: 100 },
                   { subject: 'Formulación', value: 72, fullMark: 100 },
                   { subject: 'Argumentación', value: 58, fullMark: 100 },
                 ]} />
              </div>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10">Histórico de Desempeño</h3>
              <div className="h-[350px]">
                 <BarDesempeño data={[
                   { name: 'S1', puntaje: 45 },
                   { name: 'S2', puntaje: 52 },
                   { name: 'S3', puntaje: 61 },
                   { name: 'S4', puntaje: 68 },
                 ]} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function Award(props) { return <TrendingUp {...props} />; }
function AlertCircle(props) { return <TrendingUp {...props} />; }
