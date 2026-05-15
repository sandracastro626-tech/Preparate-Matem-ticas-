import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calcularResultados } from '../utils/analysis';
import { Clock, Send, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { crearNotificacion } from '../utils/notifications';

export default function Simulacro({ drill, onFinish }) {
  const { preguntas, user, addIntento } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [timeLeft, setTimeLeft] = useState((drill.tiempoMinutos || drill.tiempo || 60) * 60);
  const [showConfirm, setShowConfirm] = useState(false);

  const drillPreguntas = preguntas.filter(p => (drill.preguntasIds || drill.preguntas || []).includes(p.id));
  const activePregunta = drillPreguntas[currentIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (opcion) => {
    setRespuestas({ ...respuestas, [activePregunta.id]: opcion });
  };

  const handleFinish = () => {
    const res = calcularResultados(respuestas, drillPreguntas);
    const nuevoIntento = {
      id: crypto.randomUUID ? crypto.randomUUID() : `res_${Date.now()}`,
      estudianteId: user.id,
      estudianteNombre: user.nombreCompleto,
      codigoEstudiante: user.codigoEstudiante || "",
      institucion: user.institucion || "",
      grupo: user.grupo || "",
      simulacroId: drill.id,
      simulacroNombre: drill.nombre || drill.titulo,
      puntajeGlobal: res.puntajeGlobal,
      correctas: res.correctas,
      incorrectas: res.incorrectas,
      totalPreguntas: drillPreguntas.length,
      competencias: res.competencias,
      componentes: res.componentes,
      respuestas,
      fecha: new Date().toISOString()
    };

    // Notificar al docente
    crearNotificacion({
      destinatarioId: user.docenteAsignado || "docente_001",
      destinatarioRol: "docente",
      titulo: "Simulacro finalizado",
      mensaje: `${user.nombreCompleto} finalizó ${drill.nombre} con ${res.puntajeGlobal}/100.`,
      tipo: "simulacro_realizado",
      prioridad: res.puntajeGlobal < 60 ? "alta" : "media",
      enlace: "resultados",
      metadata: {
        estudianteId: user.id,
        simulacroId: drill.id,
        puntaje: res.puntajeGlobal
      }
    });

    addIntento(nuevoIntento);
    onFinish(nuevoIntento);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800">{drill.nombre}</h2>
            <p className="text-xs text-slate-400">Pregunta {currentIdx + 1} de {drillPreguntas.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg 
            ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2"
          >
            Finalizar <Send size={18} />
          </button>
        </div>
        <div className="max-w-5xl mx-auto mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / drillPreguntas.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activePregunta.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl"
          >
            <div className="mb-8">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                {activePregunta.area}
              </span>
              <h3 className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">
                {activePregunta.enunciado}
              </h3>
            </div>

            {activePregunta.imagen && (
              <div className="mb-8 rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm p-2">
                <img 
                  src={activePregunta.imagen} 
                  alt="Imagen de apoyo" 
                  className="max-h-96 w-full object-contain rounded-xl"
                />
              </div>
            )}

            <div className="space-y-4">
              {Object.entries(activePregunta.opciones).map(([key, valor]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-4 group
                    ${respuestas[activePregunta.id] === key 
                      ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all
                    ${respuestas[activePregunta.id] === key 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-400 border-slate-200 group-hover:border-slate-800 group-hover:text-slate-800'}`}>
                    {key}
                  </div>
                  <span className={`text-lg transition-all ${respuestas[activePregunta.id] === key ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                    {valor}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="flex items-center gap-2 px-6 py-3 font-bold text-slate-400 hover:text-slate-800 disabled:opacity-30 transition-all font-sans uppercase tracking-widest text-sm"
          >
            <ChevronLeft size={20} /> Anterior
          </button>
          <button 
            disabled={currentIdx === drillPreguntas.length - 1}
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-3 font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-30 transition-all font-sans uppercase tracking-widest text-sm"
          >
            Siguiente <ChevronRight size={20} />
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">¿Terminar simulacro?</h3>
            <p className="text-center text-slate-500 mb-8">
              Has respondido {Object.keys(respuestas).length} de {drillPreguntas.length} preguntas.
              ¿Estás seguro de enviar tus resultados ahora?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Volver
              </button>
              <button 
                onClick={handleFinish}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
