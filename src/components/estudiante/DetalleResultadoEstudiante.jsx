import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Trophy, Target, PieChart, 
  BarChart3, Brain, ClipboardList, CheckCircle2,
  XCircle, HelpCircle, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart as ReChartsPie,
  Pie, Cell as PieCell
} from 'recharts';

export default function DetalleResultadoEstudiante({ resultado, onBack }) {
  const { 
    simulacroNombre, fecha, puntajeGlobal, correctas, incorrectas, 
    totalPreguntas, competencias, componentes, respuestas, nivel 
  } = resultado;

  const dataCompetencias = (() => {
    const base = [
      { name: "Interpretación", rawKey: "Interpretación y representación" },
      { name: "Formulación", rawKey: "Formulación y ejecución" },
      { name: "Argumentación", rawKey: "Argumentación" }
    ];
    return base.map(item => ({
      name: item.name,
      value: competencias[item.rawKey] ?? competencias[item.name] ?? 0
    }));
  })();
  const dataComponentes = Object.entries(componentes).map(([name, value]) => ({ name, value }));
  const dataPie = [
    { name: 'Correctas', value: correctas, color: '#10b981' },
    { name: 'Incorrectas', value: incorrectas, color: '#ef4444' }
  ];

  const getFeedbackPregunta = (respuesta) => {
    if (respuesta.esCorrecta) {
      return "¡Excelente! Has identificado correctamente el concepto matemático y aplicado el procedimiento adecuado.";
    } else {
      return `Te equivocaste al seleccionar ${respuesta.respuestaSeleccionada}. La respuesta correcta era ${respuesta.respuestaCorrecta}. Analiza si el error fue en la lectura (Interpretación) o en la ejecución del procedimiento.`;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Botón Volver y Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Historial
        </button>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{simulacroNombre}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Presentado el {new Date(fecha).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Grid de Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Puntaje Global</p>
          <p className="text-5xl font-black mb-2">{puntajeGlobal}</p>
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${nivel?.bg} ${nivel?.color}`}>
            Nivel {nivel?.label}
          </div>
        </div>

        <SummaryCard label="Respuestas Correctas" value={correctas} total={totalPreguntas} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50" />
        <SummaryCard label="Respuestas Incorrectas" value={incorrectas} total={totalPreguntas} icon={XCircle} color="text-rose-500" bg="bg-rose-50" />
        <SummaryCard label="Efectividad" value={`${Math.round((correctas/totalPreguntas)*100)}%`} icon={Target} color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Gráficas de Análisis Detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Gráfica por Competencias */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-10">
            <Brain className="text-indigo-600" size={24} />
            Análisis por Competencias
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCompetencias} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {dataCompetencias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 70 ? '#10b981' : entry.value > 40 ? '#6366f1' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart de Aciertos */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-xl font-black text-slate-800 mb-8 self-start">Balance de Respuestas</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReChartsPie>
                <Pie
                  data={dataPie}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPie.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </ReChartsPie>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full mt-6">
            <div className="text-center">
              <p className="text-sm font-black text-emerald-600">{correctas}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Correctas</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-rose-600">{incorrectas}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Incorrectas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Preguntas y Retroalimentación */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-10">
          <ClipboardList className="text-indigo-600" size={24} />
          Desglose de Preguntas y Retroalimentación
        </h3>
        
        <div className="space-y-6">
          {respuestas.map((resp, idx) => (
            <div key={idx} className="p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${resp.esCorrecta ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Pregunta N° {idx + 1}</p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{resp.enunciado}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{resp.competencia}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">•</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{resp.componente}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selección</p>
                      <p className={`font-black ${resp.esCorrecta ? 'text-emerald-600' : 'text-rose-600'}`}>{resp.respuestaSeleccionada}</p>
                    </div>
                    {!resp.esCorrecta && (
                      <>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correcta</p>
                          <p className="font-black text-emerald-600">{resp.respuestaCorrecta}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {resp.esCorrecta ? (
                    <div className="bg-emerald-500 text-white p-2 rounded-xl">
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div className="bg-rose-500 text-white p-2 rounded-xl">
                      <XCircle size={20} />
                    </div>
                  )}
                </div>
              </div>

              {resp.imagen && (
                <div className="mb-4 rounded-2xl border border-slate-50 bg-slate-50/30 p-2 overflow-hidden shadow-inner max-w-md">
                  <img 
                    src={resp.imagen} 
                    alt="Apoyo de pregunta" 
                    className="max-h-48 w-full object-contain rounded-xl"
                  />
                </div>
              )}

              <div className={`p-4 rounded-2xl ${resp.esCorrecta ? 'bg-emerald-50/50 text-emerald-700' : 'bg-rose-50/50 text-rose-700'} border border-transparent group-hover:border-current transition-colors`}>
                <div className="flex gap-3">
                  <HelpCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{getFeedbackPregunta(resp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, total, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <div className="flex items-baseline gap-1">
          <p className={`text-3xl font-black text-slate-800`}>{value}</p>
          {total && <span className="text-xs text-slate-300 font-bold">/ {total}</span>}
        </div>
      </div>
    </div>
  );
}
