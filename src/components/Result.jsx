import React, { useMemo } from 'react';
import { 
  Trophy, CheckCircle2, XCircle, ArrowLeft, 
  ChevronDown, MessageCircle, AlertCircle, FileText,
  BarChart3
} from 'lucide-react';
import { BarDesempeño, RadarDesempeño } from './Charts';
import { generarRecomendaciones } from '../utils/analysis';
import { motion } from 'motion/react';

// Helper de compatibilidad para bloques
const getQuestionBloques = (p) => {
  if (p.bloques && Array.isArray(p.bloques)) return p.bloques;
  
  const bloques = [];
  if (p.textoInicial || p.enunciado) bloques.push({ id: 't1', type: 'text', content: p.textoInicial || p.enunciado });
  if (p.imagen) bloques.push({ id: 'i1', type: 'image', content: p.imagen });
  if (p.textoPosterior) bloques.push({ id: 't2', type: 'text', content: p.textoPosterior });
  return bloques;
};

export default function Result({ result, onBack }) {
  const recomendaciones = generarRecomendaciones(result);
  
  const radarData = Object.entries(result.porCompetencia).map(([key, val]) => ({
    subject: key.split(' ')[0], // Short name
    value: Math.round((val.correctas / val.total) * 100),
    fullMark: 100
  }));

  const barData = Object.entries(result.porArea).map(([key, val]) => ({
    name: key,
    porcentaje: Math.round((val.correctas / val.total) * 100)
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between font-sans">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-black transition-all text-sm uppercase tracking-widest">
            <ArrowLeft size={20} /> Volver al Inicio
          </button>
          <div className="text-center">
             <h2 className="text-xl font-black text-slate-800 tracking-tight">RESULTADOS MATEMÁTICAS</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Modelo Saber 11° - Icfes</p>
          </div>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-100 flex items-center gap-2 hover:bg-red-700 transition-all uppercase tracking-widest">
               <FileText size={18} /> Exportar
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-10 space-y-12">
        
        {/* ICFES Header Style Card */}
        <section className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl shadow-red-100/20">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className={`p-12 flex flex-col items-center justify-center text-center ${result.nivel.bg} border-r border-slate-50`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Puntaje Global</p>
                <div className={`w-32 h-32 rounded-full border-8 ${result.nivel.border} flex items-center justify-center text-5xl font-black bg-white ${result.nivel.color} shadow-inner`}>
                  {result.puntajeGlobal}
                </div>
                <div className="mt-6">
                   <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Desempeño</p>
                   <h3 className={`text-2xl font-black ${result.nivel.color}`}>{result.nivel.nombre}</h3>
                </div>
            </div>
            
            <div className="md:col-span-2 p-12 space-y-8 flex flex-col justify-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <Trophy size={20} />
                  </div>
                  Interpretación del Resultado
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {result.nivel.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correctas</p>
                    <p className="text-xl font-black text-emerald-600">{result.correctas} <span className="text-slate-400 text-xs font-medium">/ {result.total}</span></p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efectividad</p>
                    <p className="text-xl font-black text-red-600">{Math.round((result.correctas / result.total) * 100)}%</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competencies Radar & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                   <BarChart3 size={20} />
                 </div>
                 Desempeño Competencias
              </h3>
              <div className="h-[300px]">
                <RadarDesempeño data={radarData} />
              </div>
           </div>
           
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <MessageCircle size={20} />
                </div>
                Ruta de Fortalecimiento
              </h3>
              <div className="space-y-4">
                {recomendaciones.map((rec, i) => (
                  <div key={i} className="p-5 bg-slate-50 border-l-4 border-red-600 rounded-2xl text-slate-700 font-bold text-sm leading-relaxed">
                    {rec}
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Detailed Feedback */}
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <div className="h-1 flex-1 bg-slate-200"></div>
              <h3 className="text-xl font-black text-slate-400 tracking-[0.2em] uppercase">Análisis por Pregunta</h3>
              <div className="h-1 flex-1 bg-slate-200"></div>
           </div>
           
           <div className="space-y-8">
              {result.detalles.map((p, idx) => (
                <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                  <div className={`p-6 flex items-center justify-between ${p.esCorrecta ? 'bg-emerald-50/30' : 'bg-rose-50/30'}`}>
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-slate-400 text-xs">
                         {idx + 1}
                       </span>
                       <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Pregunta</span>
                    </div>
                    {p.esCorrecta ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest">
                        <CheckCircle2 size={20} /> ¡Correcto!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-600 font-black text-sm uppercase tracking-widest">
                        <XCircle size={20} /> Incorrecto
                      </div>
                    )}
                  </div>
                  <div className="p-10">
                    <div className="space-y-6 mb-10">
                      {getQuestionBloques(p).map((block) => (
                        <div key={block.id}>
                          {block.type === 'text' ? (
                            <p className="text-base text-slate-800 font-bold leading-relaxed whitespace-pre-line">
                              {block.content}
                            </p>
                          ) : (
                            <div className="rounded-2xl border border-slate-50 overflow-hidden bg-slate-50 flex justify-center p-4">
                              <img 
                                src={block.content} 
                                alt="Contenido de apoyo" 
                                className="max-h-80 w-auto object-contain rounded-xl"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                      {Object.entries(p.opciones).map(([k, v]) => (
                        <div key={k} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all
                          ${k === p.respuestaCorrecta ? 'border-emerald-500 bg-emerald-50/50 font-black text-emerald-900' : 
                            k === p.respuestaEstudiante && !p.esCorrecta ? 'border-rose-500 bg-rose-50/50 text-rose-900' : 'border-slate-50 text-slate-400 bg-slate-50/30'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black
                            ${k === p.respuestaCorrecta ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 
                              k === p.respuestaEstudiante ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-300 shadow-sm'}`}>
                            {k}
                          </div>
                          <span className="text-sm font-bold">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative">
                      <div className="relative z-10">
                        <h4 className="font-black text-red-400 flex items-center gap-2 mb-4 uppercase text-[10px] tracking-widest">
                           <AlertCircle size={16} /> Retroalimentación
                        </h4>
                        <p className="text-red-50 font-bold leading-relaxed mb-6 italic">
                          {p.esCorrecta ? p.retroalimentacionCorrecta : p.retroalimentacionIncorrecta}
                        </p>
                        <div className="pt-6 border-t border-white/10">
                          <p className="text-xs text-slate-400 font-medium flex items-start gap-2">
                            <span className="text-red-400 font-black">Análisis técnico:</span> {p.explicacion}
                          </p>
                        </div>
                      </div>
                      <AlertCircle className="absolute -bottom-10 -right-10 text-white/5" size={150} />
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}

function Target(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" 
      strokeLinejoin="round" {...props}
    >
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
