import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Download, Printer, User, 
  School, Hash, Calendar, BarChart3, 
  TrendingUp, Award, CheckCircle2, ChevronRight,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

export default function ReporteIndividualEstudiante({ user, resultados }) {
  const reporte = useMemo(() => {
    if (!resultados || resultados.length === 0) return null;
    
    const count = resultados.length;
    const promedioGeneral = Math.round(resultados.reduce((a,c) => a + c.puntajeGlobal, 0) / count);
    const mejor = [...resultados].sort((a,b) => b.puntajeGlobal - a.puntajeGlobal)[0];
    const ultimo = resultados[0];

    // Promedios por competencia
    const comps = {
      "Interpretación y representación": 0,
      "Formulación y ejecución": 0,
      "Argumentación": 0
    };
    resultados.forEach(r => {
      Object.entries(r.competencias || {}).forEach(([k,v]) => {
        if (comps.hasOwnProperty(k)) {
          comps[k] += v;
        }
      });
    });
    Object.keys(comps).forEach(k => comps[k] = Math.round(comps[k] / count));

    // Promedios por componente
    const components = {};
    resultados.forEach(r => {
      Object.entries(r.componentes).forEach(([k,v]) => {
        components[k] = (components[k] || 0) + v;
      });
    });
    Object.keys(components).forEach(k => components[k] = Math.round(components[k] / count));

    const sortedComps = Object.entries(comps).sort(([,a], [,b]) => b - a);
    const fuerteComp = sortedComps[0];
    const debilComp = sortedComps[sortedComps.length - 1];

    const sortedComponents = Object.entries(components).sort(([,a], [,b]) => b - a);
    const fuerteComponent = sortedComponents[0];
    const debilComponent = sortedComponents[sortedComponents.length - 1];

    return {
      count,
      promedioGeneral,
      mejor,
      ultimo,
      competencias: (() => {
        const base = [
          { name: "Interpretación", rawKey: "Interpretación y representación" },
          { name: "Formulación", rawKey: "Formulación y ejecución" },
          { name: "Argumentación", rawKey: "Argumentación" }
        ];
        return base.map(item => ({
          name: item.name,
          value: comps[item.rawKey] ?? comps[item.name] ?? 0
        }));
      })(),
      componentes: Object.entries(components).map(([name, value]) => ({ name, value })),
      fuerteComp,
      debilComp,
      fuerteComponent,
      debilComponent,
      nivel: ultimo.nivel // Using latest level
    };
  }, [resultados]);

  const handleDownload = () => {
    window.print();
  };

  if (!reporte) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
        <FileText size={64} className="text-slate-200 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 mb-2">Reporte no disponible</h3>
        <p className="text-slate-500 font-medium">Debes completar al menos un simulacro para generar tu reporte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 print:bg-white print:p-0">
      {/* Cabecera con Botones de Acción - Se oculta al imprimir */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Reporte de Desempeño</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Análisis académico integral - Matemáticas</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
          >
            <Download size={20} />
            DESCARGAR PDF / IMPRIMIR
          </button>
        </div>
      </div>

      {/* Contenido del Reporte - Diseñado para ser Imprimible */}
      <div id="reporte-imprimible" className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-12 print:shadow-none print:border-none print:p-0">
        
        {/* Header del Informe */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg print:bg-black">
                <BarChart3 size={28} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">CHECK-ICFES <span className="text-indigo-600 print:text-black">MATH</span></h1>
            </div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] print:text-black">RESULTADOS ACADÉMICOS INDIVIDUALES</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Generación</p>
            <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Información del Estudiante */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 print:bg-white print:border-slate-200">
          <InfoItem icon={User} label="Estudiante" value={user.nombreCompleto} />
          <InfoItem icon={Hash} label="Código" value={user.codigoEstudiante || user.id.split('_')[1] || user.id} />
          <InfoItem icon={School} label="Institución" value={user.institucion || 'No Registrada'} />
          <InfoItem icon={Award} label="Grado / Grupo" value={user.grado || '11°'} />
          <InfoItem icon={Calendar} label="Simulacros" value={`${reporte.count} realizados`} />
          <InfoItem icon={TrendingUp} label="Promedio General" value={`${reporte.promedioGeneral}/100`} />
        </div>

        {/* Resumen de Puntajes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white print:bg-black">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 print:text-white/70">Último Puntaje</p>
            <p className="text-4xl font-black">{reporte.ultimo.puntajeGlobal}<span className="text-lg opacity-50 ml-1">/100</span></p>
          </div>
          <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white print:bg-slate-800">
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2 print:text-white/70">Mejor Puntaje</p>
            <p className="text-4xl font-black">{reporte.mejor.puntajeGlobal}<span className="text-lg opacity-50 ml-1">/100</span></p>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white print:bg-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 print:text-white/70">Nivel Alcanzado</p>
            <p className="text-2xl font-black">{reporte.nivel?.label || 'Básico'}</p>
          </div>
        </div>

        {/* Sección Gráficas - Al imprimir pueden saltar de página si es muy largo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 page-break-inside-avoid">
           <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-4 py-1">Desempeño por Competencias</h3>
            <div className="h-64 border border-slate-100 rounded-3xl p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reporte.competencias} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={150}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24} fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 border-l-4 border-emerald-500 pl-4 py-1">Desempeño por Componentes</h3>
            <div className="h-64 border border-slate-100 rounded-3xl p-6 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={reporte.componentes}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Radar name="Promedio" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Interpretación y Recomendaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100 page-break-inside-avoid">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Principales Fortalezas</h3>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <p className="font-black text-emerald-900 text-sm mb-1 uppercase tracking-tight">{reporte.fuerteComp[0]}</p>
                <p className="text-xs text-emerald-700 font-medium italic">Competencia más destacada</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">{reporte.fuerteComponent[0]}</p>
                <p className="text-xs text-slate-400 font-medium italic">Componente de mayor rendimiento</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Zonas de Mejora</h3>
            </div>
            <div className="space-y-4">
               <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100">
                <p className="font-black text-rose-900 text-sm mb-1 uppercase tracking-tight">{reporte.debilComp[0]}</p>
                <p className="text-xs text-rose-700 font-medium italic">Competencia prioritaria por reforzar</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">{reporte.debilComponent[0]}</p>
                <p className="text-xs text-slate-400 font-medium italic">Componente temático sugerido para estudio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Reporte */}
        <div className="pt-20 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4">PLATAFORMA CHECK-ICFES MATEMÁTICAS - 2026</p>
          <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full print:bg-black" />
        </div>

      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border-slate-200">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-800 truncate leading-tight uppercase tracking-tight">{value}</p>
      </div>
    </div>
  );
}
