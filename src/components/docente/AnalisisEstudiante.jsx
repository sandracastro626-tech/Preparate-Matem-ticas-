import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, GraduationCap, Building2, Mail, Calendar, 
  TrendingUp, Award, Target, AlertCircle, CheckCircle2, 
  ChevronRight, BarChart3, Save, MessageSquare
} from 'lucide-react';
import { BarDesempeño, RadarDesempeño } from '../Charts';

export default function AnalisisEstudiante({ estudiante, intentos, onBack }) {
  const [observacion, setObservacion] = useState('');
  const [guardado, setGuardado] = useState(false);

  const misResultados = intentos.filter(i => i.estudianteId === estudiante.id);
  const ultimoResultado = misResultados.length > 0 ? misResultados[misResultados.length - 1] : null;

  useEffect(() => {
    const saved = localStorage.getItem('observacionesDocente');
    if (saved) {
      const allObs = JSON.parse(saved);
      const myObs = allObs.find(o => o.estudianteId === estudiante.id);
      if (myObs) setObservacion(myObs.observacion);
    }
  }, [estudiante.id]);

  const handleSaveObservacion = () => {
    const saved = localStorage.getItem('observacionesDocente');
    let allObs = saved ? JSON.parse(saved) : [];
    
    // Remove old for this student if exists
    allObs = allObs.filter(o => o.estudianteId !== estudiante.id);
    
    allObs.push({
      id: crypto.randomUUID(),
      estudianteId: estudiante.id,
      observacion,
      fecha: new Date().toISOString()
    });

    localStorage.setItem('observacionesDocente', JSON.stringify(allObs));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const getPerformanceLevel = (score) => {
    if (score >= 80) return { label: 'Avanzado', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 60) return { label: 'Satisfactorio', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (score >= 40) return { label: 'Mínimo', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Insuficiente', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const nivel = ultimoResultado ? getPerformanceLevel(ultimoResultado.resultados?.puntajeGlobal || 0) : { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-50' };

  // Mock data for charts if no results
  const radarData = ultimoResultado ? Object.entries(ultimoResultado.resultados?.competencias || {}).map(([key, value]) => ({
    subject: key.split(' ')[0],
    value,
    fullMark: 100
  })) : [
    { subject: 'Interp.', value: 0, fullMark: 100 },
    { subject: 'Formul.', value: 0, fullMark: 100 },
    { subject: 'Argum.', value: 0, fullMark: 100 },
  ];

  const barData = misResultados.map(r => ({
    name: r.fecha || 'Simulacro',
    puntaje: r.resultados?.puntajeGlobal || 0
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200">
            {estudiante.nombreCompleto?.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h2 className="text-3xl font-black text-slate-800">{estudiante.nombreCompleto}</h2>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${nivel.bg} ${nivel.color}`}>
                Nivel {nivel.label}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 text-slate-500">
                <GraduationCap size={18} className="text-indigo-600" />
                <span className="text-sm font-bold">{estudiante.grupo}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Building2 size={18} className="text-indigo-600" />
                <span className="text-sm font-bold">{estudiante.institucion || 'Sede Principal'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Mail size={18} className="text-indigo-600" />
                <span className="text-sm font-bold truncate max-w-[150px]">{estudiante.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <TrendingUp size={18} className="text-emerald-500" />
                <span className="text-sm font-bold">Promedio: {misResultados.length > 0 ? Math.round(misResultados.reduce((a, b) => a + (b.resultados?.puntajeGlobal || 0), 0) / misResultados.length) : 0}%</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="absolute top-0 right-0 p-4 text-slate-300 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsMiniCard 
              label="Simulacros" 
              value={misResultados.length} 
              icon={FileText} 
              color="text-indigo-600" 
              bg="bg-indigo-50" 
            />
            <StatsMiniCard 
              label="Último Puntaje" 
              value={`${ultimoResultado?.resultados?.puntajeGlobal || 0}%`} 
              icon={Target} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
            />
            <StatsMiniCard 
              label="Progreso" 
              value="+5%" 
              icon={TrendingUp} 
              color="text-amber-600" 
              bg="bg-amber-50" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <BarChart3 size={16} /> Evolución de Resultados
               </h3>
               <div className="h-[250px]">
                 {misResultados.length > 0 ? (
                   <BarDesempeño data={barData} />
                 ) : (
                   <EmptyState message="No hay datos de evolución" />
                 )}
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Award size={16} /> Perfil Competencial
               </h3>
               <div className="h-[250px]">
                 {misResultados.length > 0 ? (
                   <RadarDesempeño data={radarData} />
                 ) : (
                   <EmptyState message="No hay datos de competencias" />
                 )}
               </div>
            </div>
          </div>

          {/* Historial de Intentos */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Historial de Simulacros</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {misResultados.length > 0 ? misResultados.map((r, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">Simulacro #{r.simulacroId}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{r.fecha}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="text-right">
                       <p className="text-lg font-black text-slate-800">{r.resultados?.puntajeGlobal}%</p>
                       <p className="text-[10px] font-black text-emerald-500 uppercase">Aprobado</p>
                     </div>
                     <ChevronRight size={20} className="text-slate-300" />
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-slate-400 font-bold">
                  Este estudiante aún no ha presentado simulacros.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Observation & Tips Column */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              Observaciones del Docente
            </h3>
            <textarea 
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Escribe sugerencias o notas de seguimiento..."
              className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-sm"
            />
            <button 
              onClick={handleSaveObservacion}
              className={`w-full py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg
                ${guardado ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-100 hover:bg-indigo-600'}`}
            >
              {guardado ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {guardado ? 'Guardado Correctamente' : 'Guardar Observación'}
            </button>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-4">Recomendaciones IA</h3>
               <div className="space-y-4">
                 <TipItem 
                    title="Componente a Reforzar" 
                    desc={ultimoResultado ? "Basado en los resultados, debe practicar Geometría (Semejanza de Triángulos)." : "Presentar el primer simulacro para obtener diagnóstico."} 
                  />
                 <TipItem 
                    title="Competencia Crítica" 
                    desc={ultimoResultado ? "Mejorar en Argumentación: Justificación de procedimientos estadísticos." : "Pendiente de evaluación inicial."} 
                  />
               </div>
             </div>
             <Target className="absolute -bottom-10 -right-10 text-white/10" size={150} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsMiniCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function TipItem({ title, desc }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">{title}</p>
      <p className="text-xs font-bold leading-relaxed">{desc}</p>
    </div>
  );
}

function FileText({ size, className }) {
  return <Award size={size} className={className} />;
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-300">
      <AlertCircle size={48} className="mb-2 opacity-20" />
      <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
    </div>
  );
}
