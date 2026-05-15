import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search } from 'lucide-react';
import Simulacro from './Simulacro';
import Result from './Result';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import ProtectedModule from './layout/ProtectedModule';
import { verificarVencimientos } from '../utils/notifications';

// Nuevos componentes de estudiante
import InicioEstudiante from './estudiante/InicioEstudiante';
import MisResultadosEstudiante from './estudiante/MisResultadosEstudiante';
import DetalleResultadoEstudiante from './estudiante/DetalleResultadoEstudiante';
import ReporteIndividualEstudiante from './estudiante/ReporteIndividualEstudiante';
import RetroalimentacionEstudiante from './estudiante/RetroalimentacionEstudiante';
import RecomendacionesEstudiante from './estudiante/RecomendacionesEstudiante';

export default function DashboardEstudiante() {
  const { user, simulacros, intentos } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [view, setView] = useState('dashboard'); // dashboard, active-drill, result-detail
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    verificarVencimientos(user, simulacros);
  }, [user, simulacros]);

  // Función flexible para obtener resultados del estudiante actual (solicitada por el usuario)
  const misResultados = useMemo(() => {
    if (!user) return [];
    
    // El usuario pide filtrar por varias equivalencias
    return intentos.filter((resultado) => {
      return (
        resultado.estudianteId === user.id ||
        resultado.usuarioId === user.id ||
        resultado.codigoEstudiante === user.codigoEstudiante ||
        resultado.estudianteNombre === user.nombreCompleto
      );
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha desc
  }, [intentos, user]);

  const handleStartDrill = (drill) => {
    const ahora = new Date();
    const apertura = drill.fechaApertura ? new Date(drill.fechaApertura) : null;
    const cierre = drill.fechaCierre ? new Date(drill.fechaCierre) : null;

    const estaDisponible = (!apertura || ahora >= apertura) && (!cierre || ahora <= cierre);

    if (!estaDisponible) {
      const mensaje = (apertura && ahora < apertura) 
        ? `Este simulacro estará disponible a partir del ${drill.fechaApertura}.` 
        : `Este simulacro venció el ${drill.fechaCierre}.`;
      alert(mensaje);
      return;
    }

    const intentosRealizados = misResultados.filter(r => r.simulacroId === drill.id).length;
    const maxIntentos = drill.intentosPermitidos || 1;

    if (intentosRealizados >= maxIntentos) {
      alert("Ya alcanzaste el número máximo de intentos permitidos para este simulacro.");
      return;
    }

    setSelectedDrill(drill);
    setView('active-drill');
  };

  const handleFinishDrill = (intento) => {
    setSelectedResult(intento);
    setView('result-detail');
  };

  const getPageContext = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Inicio', subtitle: `¡Qué bueno verte, ${user.nombreCompleto}!` };
      case 'misSimulacros': return { title: 'Mis Simulacros', subtitle: 'Exámenes asignados por tus docentes' };
      case 'resultados': return { title: 'Mis Resultados', subtitle: 'Análisis detallado de tu desempeño histórico' };
      case 'reporte': return { title: 'Reporte Individual', subtitle: 'Informe consolidado de resultados matemáticas' };
      case 'feedback': return { title: 'Retroalimentación', subtitle: 'Análisis de fortalezas y debilidades' };
      case 'recomendaciones': return { title: 'Recomendaciones', subtitle: 'Plan de mejora y orientación vocacional' };
      default: return { title: 'Panel Estudiante', subtitle: '' };
    }
  };

  // Filtrar simulacros para el estudiante según asignación
  const simulacrosFiltrados = useMemo(() => {
    if (!user) return [];

    const filtrados = simulacros.filter((simulacro) => {
      const estado = String(simulacro.estado || "publicado").toLowerCase();

      const publicado =
        estado === "publicado" ||
        estado === "activo" ||
        estado === "habilitado" ||
        estado === "disponible" ||
        simulacro.visible === true;

      const asignadoA = simulacro.asignadoA || {};

      const asignadoDirecto =
        Array.isArray(simulacro.estudiantesAsignados) &&
        simulacro.estudiantesAsignados.includes(user.id);

      const asignadoDirectoEnObjeto =
        Array.isArray(asignadoA.estudiantesIds) &&
        asignadoA.estudiantesIds.includes(user.id);

      const asignadoPorGrupo =
        asignadoA.tipo === "grupo" &&
        asignadoA.grupo === user.grupo &&
        asignadoA.institucion === user.institucion;

      const asignadoPorGrupoCompatibilidad =
        simulacro.grupoAsignado === user.grupo &&
        simulacro.institucion === user.institucion;

      const asignadoPorInstitucion =
        asignadoA.tipo === "institucion" &&
        asignadoA.institucion === user.institucion;

      const asignadoPorInstitucionCompatibilidad =
        simulacro.institucion === user.institucion &&
        !simulacro.grupoAsignado;

      const asignadoATodos =
        asignadoA.tipo === "todos" ||
        simulacro.destinatario === "todos";

      return (
        publicado &&
        (
          asignadoDirecto ||
          asignadoDirectoEnObjeto ||
          asignadoPorGrupo ||
          asignadoPorGrupoCompatibilidad ||
          asignadoPorInstitucion ||
          asignadoPorInstitucionCompatibilidad ||
          asignadoATodos
        )
      );
    });

    if (!searchTerm) return filtrados;
    
    return filtrados.filter(s => 
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [simulacros, user, searchTerm]);

  if (view === 'active-drill') {
    return <Simulacro drill={selectedDrill} onFinish={handleFinishDrill} />;
  }

  if (view === 'result-detail') {
    return <DetalleResultadoEstudiante resultado={selectedResult} onBack={() => { setView('dashboard'); setActiveTab('resultados'); }} />;
  }

  const { title, subtitle } = getPageContext();

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} user={user} onNavigate={setActiveTab}>
           <div className="relative hidden md:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar en el panel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-3 w-64 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:w-80 transition-all placeholder:text-slate-400"
            />
          </div>
        </Header>
        
        <main className="p-10 flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <InicioEstudiante user={user} resultados={misResultados} />
          )}

          {activeTab === 'misSimulacros' && (
            <ProtectedModule permiso="presentarSimulacros">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {simulacrosFiltrados.map(s => (
                  <DrillCard key={s.id} drill={s} onStart={() => handleStartDrill(s)} misResultados={misResultados} />
                ))}
              </div>
            </ProtectedModule>
          )}

          {activeTab === 'resultados' && (
            <ProtectedModule permiso="verReporteIndividual">
               <MisResultadosEstudiante resultados={misResultados} onVerDetalle={(res) => { setSelectedResult(res); setView('result-detail'); }} />
            </ProtectedModule>
          )}

          {activeTab === 'reporte' && (
            <ProtectedModule permiso="verReporteIndividual">
               <ReporteIndividualEstudiante user={user} resultados={misResultados} />
            </ProtectedModule>
          )}

          {activeTab === 'feedback' && (
            <ProtectedModule permiso="verRetroalimentacion">
              <RetroalimentacionEstudiante resultados={misResultados} />
            </ProtectedModule>
          )}

          {activeTab === 'recomendaciones' && (
            <ProtectedModule permiso="verRetroalimentacion">
              <RecomendacionesEstudiante 
                resultados={misResultados} 
                user={user}
                onNavigate={setActiveTab}
              />
            </ProtectedModule>
          )}
        </main>
      </div>
    </div>
  );
}

function DrillCard({ drill, onStart, misResultados }) {
  const ahora = new Date();
  const apertura = drill.fechaApertura ? new Date(drill.fechaApertura) : null;
  const cierre = drill.fechaCierre ? new Date(drill.fechaCierre) : null;
  const vencido = cierre && ahora > cierre;
  const futuro = apertura && ahora < apertura;
  const intentosRealizados = misResultados.filter(r => r.simulacroId === drill.id).length;
  const maxIntentos = drill.intentosPermitidos || 1;
  const sinIntentos = intentosRealizados >= maxIntentos;

  return (
    <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all group flex flex-col ${vencido || sinIntentos ? 'opacity-75' : 'hover:shadow-xl'}`}>
      <div className="mb-6 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-widest">Matemáticas</span>
            {vencido ? (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-black uppercase tracking-widest">Vencido</span>
            ) : futuro ? (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-black uppercase tracking-widest">Próximamente</span>
            ) : drill.nuevo && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-black uppercase tracking-widest">Nuevo</span>
            )}
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {drill.autorRol === 'administrador' ? 'OFICIAL' : 'DOCENTE'}
          </p>
        </div>
        <h4 className="font-black text-slate-800 text-lg mb-2 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{drill.nombre}</h4>
        <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 mb-4">{drill.descripcion}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Intentos</span>
            <span className="text-xs font-black text-slate-600">{intentosRealizados} de {maxIntentos}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Expira</span>
            <span className="text-xs font-black text-slate-600">{drill.fechaCierre || 'Sin límite'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
            {drill.autorNombre?.charAt(0) || 'D'}
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Creado por</p>
            <p className="text-[11px] font-bold text-slate-700 truncate">{drill.autorNombre || 'Docente'}</p>
          </div>
        </div>
      </div>
      
      {futuro ? (
        <div className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
          DISPONIBLE PRONTO
        </div>
      ) : vencido ? (
        <div className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
          PLAZO VENCIDO
        </div>
      ) : sinIntentos ? (
        <div className="w-full py-4 bg-emerald-50 text-emerald-600 font-black rounded-2xl flex items-center justify-center gap-3 cursor-default">
          COMPLETADO
        </div>
      ) : (
        <button 
          onClick={onStart}
          className="w-full py-4 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
        >
          COMENZAR EXAMEN
        </button>
      )}
    </div>
  );
}

