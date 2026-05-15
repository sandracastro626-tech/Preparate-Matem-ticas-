import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, Brain, Target, AlertTriangle, 
  Lightbulb, Zap, CheckCircle2, XCircle,
  HelpCircle, ChevronRight
} from 'lucide-react';

export default function RetroalimentacionEstudiante({ resultados }) {
  const data = useMemo(() => {
    if (!resultados || resultados.length === 0) return null;
    
    // Tomamos el último resultado para la retroalimentación más fresca
    const ultimo = resultados[0];
    const totalSimulacros = resultados.length;

    // Calcular promedios para detectar debilidades sistémicas vs puntuales
    const promediosComps = {};
    resultados.forEach(r => {
      Object.entries(r.competencias).forEach(([k,v]) => {
        promediosComps[k] = (promediosComps[k] || 0) + v;
      });
    });
    Object.keys(promediosComps).forEach(k => promediosComps[k] = Math.round(promediosComps[k] / totalSimulacros));

    const sortedComps = Object.entries(ultimo.competencias).sort(([,a], [,b]) => b - a);
    const sortedComponents = Object.entries(ultimo.componentes).sort(([,a], [,b]) => b - a);

    // Identificar errores frecuentes (simulado basado en los datos de respuestas del último resultado)
    const erroresFrecuentes = ultimo.respuestas.filter(r => !r.esCorrecta).slice(0, 3);

    return {
      ultimo,
      fuerteComp: sortedComps[0],
      debilComp: sortedComps[sortedComps.length - 1],
      fuerteComponent: sortedComponents[0],
      debilComponent: sortedComponents[sortedComponents.length - 1],
      erroresFrecuentes
    };
  }, [resultados]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
        <MessageSquare size={64} className="text-slate-200 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 mb-2">Sin retroalimentación</h3>
        <p className="text-slate-500 font-medium">Presenta un simulacro para que podamos analizar tus respuestas.</p>
      </div>
    );
  }

  const getInterpretacionCompetencia = (nombre, puntaje) => {
    const esBajo = puntaje < 60;
    if (nombre === 'Interpretación y representación') {
      return esBajo 
        ? "Debes fortalecer la lectura e interpretación de información presentada en tablas, gráficas, diagramas, figuras y enunciados. Practica ejercicios donde debas identificar datos relevantes, transformar información y reconocer relaciones entre variables."
        : "Tienes buen desempeño interpretando y representando información matemática. Esto indica que comprendes datos en diferentes formatos y puedes extraer información relevante para resolver problemas.";
    }
    if (nombre === 'Formulación y ejecución') {
      return esBajo
        ? "Debes reforzar la selección y aplicación de procedimientos matemáticos. Practica problemas donde debas plantear estrategias, ejecutar operaciones y verificar si el procedimiento usado es adecuado."
        : "Tienes buen desempeño formulando y ejecutando procedimientos. Esto muestra que puedes plantear estrategias de solución y aplicar herramientas matemáticas en diferentes contextos.";
    }
    if (nombre === 'Argumentación') {
      return esBajo
        ? "Debes fortalecer la justificación de procedimientos y la validación de afirmaciones. Practica ejercicios donde debas explicar por qué una respuesta es correcta o incorrecta, analizar procedimientos y defender conclusiones."
        : "Tienes buen desempeño argumentando soluciones matemáticas. Esto indica que puedes validar procedimientos, justificar respuestas y analizar la pertinencia de una solución.";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Resumen de Desempeño */}
      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-6 flex items-center gap-4">
            <Zap className="text-amber-400" />
            Análisis de Retroalimentación
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed text-lg">
            Basado en tu último simulacro (<span className="text-white font-black">{data.ultimo.simulacroNombre}</span>), hemos analizado tus respuestas para identificar patrones de éxito y áreas de oportunidad.
          </p>
        </div>
        <Brain className="absolute top-[-20px] right-[-20px] text-slate-800/40 w-64 h-64 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fortalezas y Debilidades */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-500" />
            Fortalezas Identificadas
          </h3>
          <div className="space-y-4">
            <FeatureItem 
              label="Competencia Dominante" 
              value={data.fuerteComp[0]} 
              color="text-emerald-600" 
              bg="bg-emerald-50"
              icon={Brain}
            />
            <FeatureItem 
              label="Componente más fuerte" 
              value={data.fuerteComponent[0]} 
              color="text-indigo-600" 
              bg="bg-indigo-50"
              icon={Target}
            />
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50">
             <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <AlertTriangle size={24} className="text-rose-500" />
              Aspectos por Mejorar
            </h3>
            <div className="space-y-4">
              <FeatureItem 
                label="Competencia a Reforzar" 
                value={data.debilComp[0]} 
                color="text-rose-600" 
                bg="bg-rose-50"
                icon={Brain}
              />
               <FeatureItem 
                label="Componente Crítico" 
                value={data.debilComponent[0]} 
                color="text-amber-600" 
                bg="bg-amber-50"
                icon={Target}
              />
            </div>
          </div>
        </div>

        {/* Interpretación Detallada */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-2">
            <Lightbulb size={24} className="text-amber-500" />
            Interpretación Académica
          </h3>
          {Object.entries(data.ultimo.competencias).map(([name, val]) => (
            <div key={name} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{name}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${val >= 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {val}%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {getInterpretacionCompetencia(name, val)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Errores Frecuentes y Consejos */}
      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200">
        <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3 px-2">
          <Target className="text-indigo-600" />
          Análisis de Errores y Consejos de Mejora
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-4">¿En qué estás fallando?</h4>
            {data.erroresFrecuentes.length > 0 ? (
              data.erroresFrecuentes.map((error, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex gap-4 shadow-sm group hover:border-indigo-100 transition-colors">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <div className="flex gap-2 mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{error.competencia}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">•</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{error.componente}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-tight mb-2">{error.enunciado}</p>

                    {error.imagen && (
                      <div className="mb-3 rounded-xl border border-slate-50 bg-white p-1 overflow-hidden w-fit max-w-[200px]">
                        <img src={error.imagen} alt="Apoyo" className="max-h-24 object-contain rounded-lg" />
                      </div>
                    )}

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Elegiste <span className="font-bold text-rose-500">"{error.respuestaSeleccionada}"</span> cuando la correcta era <span className="font-bold text-emerald-600">"{error.respuestaCorrecta}"</span>. Esto sugiere que {error.competencia === 'Argumentación' ? 'falta validar la coherencia lógica de tu respuesta.' : 'debes revisar el planteamiento del procedimiento matemático.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-[2rem] text-center border border-slate-100">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">¡Increíble! No cometiste errores en este simulacro.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Consejos Rápidos</h4>
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white space-y-6">
              <TipItem num="1" text="Lee dos veces cada enunciado antes de mirar las opciones de respuesta." />
              <TipItem num="2" text="Usa dibujos o esquemas para representar los problemas matemáticos." />
              <TipItem num="3" text="Descarta las opciones que son evidentemente incorrectas por escala o lógica." />
              <TipItem num="4" text="Revisa siempre tus cálculos al terminar cada pregunta si te sobra tiempo." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ label, value, color, bg, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-black text-slate-800 leading-tight`}>{value}</p>
      </div>
    </div>
  );
}

function TipItem({ num, text }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{num}</span>
      <p className="text-xs font-bold leading-relaxed text-indigo-100">{text}</p>
    </div>
  );
}
