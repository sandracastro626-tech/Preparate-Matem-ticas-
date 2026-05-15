import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Star, BookOpen, GraduationCap, 
  MapPin, Landmark, ArrowRight, Lightbulb, 
  Target, Brain, Zap, Briefcase, Info, 
  Calculator, LineChart, Box, ChevronDown, CheckCircle,
  Clock, Award
} from 'lucide-react';
import { crearNotificacion } from '../../utils/notifications';

export default function RecomendacionesEstudiante({ resultados, user, onNavigate }) {
  const [semanaAbierta, setSemanaAbierta] = useState(null);
  const [completados, setCompletados] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('avancePlanMejora');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.estudianteId === user?.id) {
        setCompletados(parsed.semanasCompletadas || []);
      }
    }
  }, [user]);

  const toggleSemana = (id) => {
    setSemanaAbierta(semanaAbierta === id ? null : id);
  };

  const marcarCompletado = (id) => {
    const isNowCompleted = !completados.includes(id);
    const newCompletados = isNowCompleted
      ? [...completados, id]
      : completados.filter(item => item !== id);
    
    setCompletados(newCompletados);
    localStorage.setItem('avancePlanMejora', JSON.stringify({
      estudianteId: user.id,
      semanasCompletadas: newCompletados,
      fechaActualizacion: new Date().toISOString()
    }));

    if (isNowCompleted) {
      crearNotificacion({
        destinatarioId: user.docenteAsignado || "docente_001",
        destinatarioRol: "docente",
        titulo: "Semana del plan completada",
        mensaje: `${user.nombreCompleto} marcó como completada la ${id} de su plan de mejora.`,
        tipo: "actividad_estudiante",
        prioridad: "baja",
        enlace: "mis_estudiantes",
        metadata: {
          estudianteId: user.id,
          semana: id
        }
      });
    }
  };

  const analitica = useMemo(() => {
    if (!resultados || resultados.length === 0) return null;
    
    // Promedio de todos los simulacros
    const total = resultados.length;
    const comps = {};
    const components = {};
    let puntajePromedio = 0;

    resultados.forEach(r => {
      puntajePromedio += r.puntajeGlobal;
      Object.entries(r.competencias).forEach(([k,v]) => {
        comps[k] = (comps[k] || 0) + v;
      });
      Object.entries(r.componentes).forEach(([k,v]) => {
        components[k] = (components[k] || 0) + v;
      });
    });

    Object.keys(comps).forEach(k => comps[k] = Math.round(comps[k] / total));
    Object.keys(components).forEach(k => components[k] = Math.round(components[k] / total));
    puntajePromedio = Math.round(puntajePromedio / total);

    const sortedComps = Object.entries(comps).sort(([,a], [,b]) => b - a);
    const sortedComponents = Object.entries(components).sort(([,a], [,b]) => b - a);

    return {
      puntajePromedio,
      fuerteComp: sortedComps[0],
      debilComp: sortedComps[sortedComps.length - 1],
      fuerteComponent: sortedComponents[0],
      debilComponent: sortedComponents[sortedComponents.length - 1]
    };
  }, [resultados]);

  const planModulado = useMemo(() => {
    // Si no hay analítica, se usa un plan genérico
    const debilComp = analitica?.debilComp ? analitica.debilComp[0] : 'Interpretación y representación';
    const debilComponent = analitica?.debilComponent ? analitica.debilComponent[0] : 'Estadística';

    return [
      {
        id: "W1",
        tag: "W1",
        titulo: `Reforzar competencia de ${debilComp}`,
        descripcion: `Enfócate en fortalecer ${debilComp.toLowerCase()} mediante la práctica deliberada y el análisis de errores.`,
        actividades: [
          `Resolver 10 preguntas enfocadas en ${debilComp}.`,
          "Escribir el plan de solución antes de calcular.",
          "Revisar las opciones incorrectas y justificar por qué no responden a la tarea.",
          "Registrar los errores frecuentes en un cuaderno de seguimiento."
        ],
        meta: `Mejorar tu efectividad en ${debilComp} y reducir fallos por interpretación.`,
        tiempo: "30 minutos diarios durante 5 días.",
        recursos: ["Banco de preguntas CHECK-ICFES", "Retroalimentación de simulacros", "Cuaderno de errores"]
      },
      {
        id: "W2",
        tag: "W2",
        titulo: `Practicar componente de ${debilComponent}`,
        descripcion: `Mejora tu dominio temático en ${debilComponent.toLowerCase()} repasando fundamentos y aplicando conceptos en problemas reales.`,
        actividades: [
          `Resolver preguntas del componente de ${debilComponent}.`,
          `Repasar conceptos clave de ${debilComponent} en el libro o videos.`,
          "Identificar fórmulas o representaciones que suelen aparecer.",
          "Hacer una lista de errores comunes en esta área temática."
        ],
        meta: `Aumentar la precisión y confianza en el área de ${debilComponent}.`,
        tiempo: "30 a 40 minutos diarios.",
        recursos: ["Libro guía Matemáticas", "Videos explicativos", "Banco de preguntas"]
      },
      {
        id: "W3",
        tag: "W3",
        titulo: "Gestión del tiempo y Mini-Simulacros",
        descripcion: "Entrenamiento de velocidad y precisión bajo presión de tiempo.",
        actividades: [
          "Presentar dos mini-simulacros (10-15 preguntas c/u).",
          "Medir el tiempo real usado por cada pregunta.",
          "Revisar analíticamente cada respuesta fallida.",
          "Repetir preguntas similares para validar aprendizaje."
        ],
        meta: "Optimizar la velocidad de respuesta sin sacrificar la precisión.",
        tiempo: "Dos sesiones de 45 minutos.",
        recursos: ["Cronómetro", "Simulacros cortos", "Hojas de respuesta de práctica"]
      },
      {
        id: "W4",
        tag: "W4",
        titulo: "Simulacro Integral y Cierre de Mes",
        descripcion: "Evaluación general para medir el avance comparativo respecto al mes anterior.",
        actividades: [
          "Presentar un simulacro completo (25+ preguntas).",
          "Revisar resultados comparativos por competencia.",
          "Evaluar si la competencia objetivo (W1) mejoró.",
          "Ajustar el plan para el siguiente mes educativo."
        ],
        meta: "Validar el progreso integral y consolidar la confianza para la prueba real.",
        tiempo: "Una sesión de 2 horas (Simulacro + Revisión).",
        recursos: ["Simulacro completo", "Reporte de resultados", "Plan de mejora mes 2"]
      }
    ];
  }, [analitica]);

  const getSugerenciasCarreras = () => {
    if (!analitica) return ["Ingeniería Industrial", "Administración de Empresas", "Economía", "Ingeniería de Sistemas"];
    const { fuerteComp, fuerteComponent } = analitica;
    const compName = fuerteComp[0];
    const componentName = fuerteComponent[0];
    
    let carreras = [];
    
    if (componentName === 'Álgebra y cálculo' || (compName === 'Formulación y ejecución')) {
      carreras = [
        "Ingeniería de Sistemas", "Ingeniería Industrial", "Ingeniería Mecánica",
        "Ingeniería Civil", "Matemáticas", "Física", "Economía", "Administración de Empresas (Cuantitativo)"
      ];
    } else if (componentName === 'Estadística') {
      carreras = [
        "Estadística", "Ciencia de Datos", "Economía", "Contaduría Pública",
        "Administración de Empresas", "Finanzas", "Ingeniería Industrial", "Mercadeo (Análisis de datos)"
      ];
    } else if (componentName === 'Geometría') {
      carreras = [
        "Arquitectura", "Ingeniería Civil", "Diseño Industrial", "Ingeniería Mecánica",
        "Topografía", "Diseño Gráfico (Enfoque espacial)", "Licenciatura en Matemáticas"
      ];
    } else if (compName === 'Argumentación') {
      carreras = [
        "Derecho", "Economía", "Administración Pública", "Licenciatura en Matemáticas",
        "Filosofía", "Ciencias Políticas", "Ingeniería de Sistemas (Lógica)"
      ];
    } else {
      carreras = ["Ingeniería Industrial", "Administración de Empresas", "Economía", "Ingeniería de Sistemas"];
    }

    return carreras;
  };

  const carrerasSug = getSugerenciasCarreras();

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Plan de Mejora Académica */}
      <section className="space-y-8">
        <div className="bg-indigo-600 p-12 rounded-[3.5rem] text-white overflow-hidden relative">
           <div className="relative z-10">
             <h2 className="text-4xl font-black tracking-tight mb-4">Plan de Mejora Académica</h2>
             <p className="text-indigo-100 font-medium leading-relaxed max-w-2xl">
               Basado en tus resultados promedio, hemos diseñado una ruta de aprendizaje para fortalecer tus habilidades matemáticas antes de la prueba ICFES.
             </p>
           </div>
           <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
             <ShieldCheck size={200} />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card: Estrategias de Estudio */}
          {analitica ? (
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <BookOpen className="text-indigo-600" />
                Estrategias de Estudio Personalizadas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                  <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest mb-4">Meta #1: {analitica.debilComp[0]}</h4>
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed mb-6">
                    Presentas una efectividad del {analitica.debilComp[1]}% en esta competencia. Es tu prioridad número uno.
                  </p>
                  <ul className="space-y-4">
                    <TipBullet text={analitica.debilComp[0] === 'Interpretación y representación' ? 'Practica lectura de gráficas, tablas y diagramas diariamente.' : analitica.debilComp[0] === 'Formulación y ejecución' ? 'Trabaja en problemas de varios pasos subrayando el plan de solución.' : 'Escribe una explicación de por qué tu respuesta es correcta después de cada ejercicio.'} />
                    <TipBullet text="Revisa videos educativos sobre este tipo de razonamiento." />
                    <TipBullet text="Resuelve 5 preguntas diarias enfocadas solo en esta competencia." />
                  </ul>
                </div>

                <div className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                  <h4 className="font-black text-emerald-900 text-sm uppercase tracking-widest mb-4">Meta #2: {analitica.debilComponent[0]}</h4>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed mb-6">
                    Reforzar el componente de <span className="font-bold">{analitica.debilComponent[0]}</span> te dará los puntos extra necesarios.
                  </p>
                  <ul className="space-y-4">
                    <TipBullet green text={`Repasa conceptos fundamentales de ${analitica.debilComponent[0]}.`} />
                    <TipBullet green text="Usa simulacros cortos por temática para medir avance." />
                    <TipBullet green text="Identifica los errores más comunes en este tema." />
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Info size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold max-w-xs">Aún no tienes resultados suficientes para personalizar tus estrategias. Te sugerimos iniciar con un simulacro diagnóstico.</p>
              <button 
                onClick={() => onNavigate('misSimulacros')}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors"
              >
                IR A SIMULACROS
              </button>
            </div>
          )}

          {/* Card: Plan de Mejora (Acordeón) */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col overflow-hidden">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Target className="text-rose-500" />
              Plan de Mejora (Mes Actual)
            </h3>
            
            <div className="space-y-4 flex-1">
              {planModulado.map((week, idx) => {
                const isOpen = semanaAbierta === week.id;
                const isCompleted = completados.includes(week.id);

                return (
                  <div key={week.id} className="border-b border-slate-800 last:border-0 pb-4 last:pb-0">
                    <button 
                      onClick={() => toggleSemana(week.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isOpen ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-100'}`}>
                          {isCompleted ? <CheckCircle size={18} /> : week.tag}
                        </div>
                        <div>
                          <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                            Semana {idx + 1} {isCompleted && '• Completado'}
                          </p>
                          <p className="text-sm font-bold text-slate-100 leading-tight">{week.titulo}</p>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-6 bg-slate-800 rounded-3xl space-y-6">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Descripción</p>
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">{week.descripcion}</p>
                            </div>

                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-bold">Actividades sugeridas</p>
                              <ul className="space-y-2">
                                {week.actividades.map((act, i) => (
                                  <li key={i} className="flex gap-2 text-xs text-slate-400 font-medium">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                                    {act}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-slate-700/50 rounded-xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tiempo</p>
                                <p className="text-[10px] font-bold text-slate-200">{week.tiempo}</p>
                              </div>
                              <div className="p-3 bg-slate-700/50 rounded-xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Meta</p>
                                <p className="text-[10px] font-bold text-slate-200 leading-tight">{week.meta}</p>
                              </div>
                            </div>

                            <div className="space-y-3 pt-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); marcarCompletado(week.id); }}
                                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isCompleted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/40'}`}
                              >
                                {isCompleted ? 'DESMARCAR COMO COMPLETADA' : 'MARCAR COMO COMPLETADA'}
                              </button>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => onNavigate('overview')}
                                  className="py-3 bg-slate-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-600 transition-colors"
                                >
                                  IR A INICIO
                                </button>
                                <button 
                                  onClick={() => onNavigate('misSimulacros')}
                                  className="py-3 bg-slate-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-600 transition-colors"
                                >
                                  SIMULACROS
                                </button>
                              </div>
                              <p className="text-[9px] text-slate-500 text-center font-medium italic">
                                * El banco de preguntas está gestionado por tus docentes. Recurre a simulacros para practicar.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </section>

      {/* Orientación Vocacional */}
      <section className="space-y-8 bg-slate-50 p-12 rounded-[4rem] border-2 border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
              <GraduationCap className="text-indigo-600" size={36} />
              Carreras sugeridas según tu perfil matemático
            </h2>
            <p className="text-slate-500 font-medium mt-2">Encontramos programas universitarios en Colombia que coinciden con tus fortalezas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {carrerasSug.map((carrera, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Briefcase size={20} />
                  </div>
                  <span className="font-bold text-slate-700">{carrera}</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Landmark size={14} />
                Explorar Universidades
              </h4>
              <div className="space-y-3">
                {['UNAL', 'Antioquia', 'Valle', 'Distrital', 'Javeriana', 'Los Andes', 'Rosario', 'EAFIT'].map(u => (
                  <div key={u} className="flex items-center justify-between text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                    {u} <MapPin size={12} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex gap-2 text-amber-700 mb-2">
                <Info size={16} className="mt-0.5" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nota Aclaratoria</p>
              </div>
              <p className="text-[10px] text-amber-900/60 font-medium leading-relaxed">
                Sugerencias orientativas. Consulta siempre las páginas oficiales de cada universidad en Colombia para conocer costos, admisiones y sedes actualizadas.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function TipBullet({ text, green = false }) {
  return (
    <li className="flex gap-3 text-xs font-bold leading-relaxed">
      <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${green ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
      <span className={green ? 'text-emerald-900/60' : 'text-indigo-900/60'}>{text}</span>
    </li>
  );
}
