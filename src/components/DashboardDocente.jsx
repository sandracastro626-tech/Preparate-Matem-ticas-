import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, TrendingUp, Download, GraduationCap, 
  ArrowUpRight, Search, FileText, LayoutGrid, PlusCircle, BookOpen
} from 'lucide-react';
import { BarDesempeño, RadarDesempeño } from './Charts';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import ProtectedModule from './layout/ProtectedModule';
import { obtenerEstudiantesDelDocente } from '../utils/docenteUtils';
import { crearNotificacion } from '../utils/notifications';

// New Docente Components
import MisGruposDocente from './docente/MisGruposDocente';
import MisEstudiantesDocente from './docente/MisEstudiantesDocente';
import BancoPreguntasDocente from './docente/BancoPreguntasDocente';
import FormularioPreguntaDocente from './docente/FormularioPreguntaDocente';
import SimulacrosDocente from './docente/SimulacrosDocente';
import ResultadosDocente from './docente/ResultadosDocente';
import ReportesDocente from './docente/ReportesDocente';
import SolicitudesFunciones from './admin/SolicitudesFunciones';
import AnalisisEstudiante from './docente/AnalisisEstudiante';

export default function DashboardDocente() {
  const { user, usuarios, intentos, simulacros, preguntas, addPregunta } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGroup, setSelectedGroup] = useState((user.gruposAsignados && user.gruposAsignados.length > 0) ? user.gruposAsignados[0] : '');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const estudiantesDocente = obtenerEstudiantesDelDocente(usuarios, user);
  const estudiantesGrupo = estudiantesDocente.filter(u => u.grupo === selectedGroup);
  const intentosGrupo = intentos.filter(i => estudiantesGrupo.some(e => e.id === i.estudianteId));

  const averageScore = intentosGrupo.length > 0 
    ? Math.round(intentosGrupo.reduce((acc, curr) => acc + (curr.resultados?.puntajeGlobal || 0), 0) / intentosGrupo.length)
    : 0;

  const getPageContext = () => {
    if (selectedStudent) return { title: 'Análisis Estudiante', subtitle: `Detalle académico de ${selectedStudent.nombreCompleto}` };
    
    switch (activeTab) {
      case 'overview': return { title: 'Inicio Docente', subtitle: `Bienvenido de nuevo, ${user.nombreCompleto}` };
      case 'groups': return { title: 'Mis Grupos', subtitle: 'Gestión de cursos y asignaturas' };
      case 'students': return { title: 'Mis Estudiantes', subtitle: `Seguimiento individual` };
      case 'bank': return { title: 'Banco de Preguntas', subtitle: 'Consultar y administrar ítems evaluativos' };
      case 'addPregunta': return { title: 'Crear Pregunta', subtitle: 'Nueva pregunta tipo ICFES' };
      case 'simulacros': return { title: 'Mis Simulacros', subtitle: 'Creación y asignación de exámenes' };
      case 'reports': return { title: 'Reportes y Análisis', subtitle: 'Informes detallados por grupo y estudiante' };
      case 'requests': return { title: 'Solicitudes', subtitle: 'Buzón de requerimientos funcionales' };
      default: return { title: 'Panel Docente', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageContext();

  const handleSavePregunta = (data) => {
    addPregunta({
      ...data,
      creadoPor: user.id,
      autorNombre: user.nombreCompleto,
      origen: 'docente',
      fechaCreacion: new Date().toISOString()
    });

    crearNotificacion({
      destinatarioRol: "administrador",
      titulo: "Nueva pregunta creada",
      mensaje: `${user.nombreCompleto} creó una nueva pregunta en el banco.`,
      tipo: "sistema",
      prioridad: "baja",
      enlace: "bank"
    });

    setActiveTab('bank');
  };

  const changeTab = (tab) => {
    setSelectedStudent(null);
    setActiveTab(tab);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={changeTab} />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} user={user} onNavigate={setActiveTab} />
        
        <main className="p-10 flex-1">
          {selectedStudent ? (
            <AnalisisEstudiante 
              estudiante={selectedStudent} 
              intentos={intentos} 
              onBack={() => setSelectedStudent(null)} 
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button 
                      onClick={() => setActiveTab('students')}
                      className="text-left w-full"
                    >
                      <StatsCard label="Estudiantes" value={estudiantesDocente.length} trend="+2 esta semana" icon={Users} color="text-blue-600" bg="bg-blue-50" />
                    </button>
                    <StatsCard label="Promedio General" value={`${averageScore}%`} trend="Estable" icon={TrendingUp} color="text-red-600" bg="bg-red-50" />
                    <StatsCard label="Mis Grupos" value={user.gruposAsignados?.length || 0} trend="Activos" icon={LayoutGrid} color="text-purple-600" bg="bg-purple-50" />
                    <StatsCard label="Simulacros" value={simulacros.length} trend="Actualizado" icon={FileText} color="text-orange-600" bg="bg-orange-50" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <h3 className="font-extrabold mb-8 text-slate-800 flex items-center gap-2">
                        <TrendingUp className="text-red-600" />
                        Desempeño por Competencia (Promedio)
                      </h3>
                      <div className="h-[350px]">
                        <RadarDesempeño data={[
                          { subject: 'Interpretación', value: 65, fullMark: 100 },
                          { subject: 'Formulación', value: 72, fullMark: 100 },
                          { subject: 'Argumentación', value: 58, fullMark: 100 },
                        ]} />
                      </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-extrabold text-slate-800">Estudiantes en Riesgo</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-3 py-1 rounded-full">
                          Bajo Desempeño
                        </span>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {estudiantesDocente.length > 0 ? (
                          estudiantesDocente.slice(0, 6).map((e, index) => (
                            <div key={index} className="px-8 py-4 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 group transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black transition-colors group-hover:bg-red-100 group-hover:text-red-700">
                                  {e.nombreCompleto?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-extrabold text-slate-800 text-sm group-hover:text-red-600 transition-colors">{e.nombreCompleto}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grupo: {e.grupo}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setSelectedStudent(e)}
                                className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-red-100 group-hover:text-red-600 transition-all"
                              >
                                <ArrowUpRight size={20} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center text-slate-400">
                            No hay estudiantes asignados bajo su perfil.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'students' && <MisEstudiantesDocente />}
              {activeTab === 'groups' && <MisGruposDocente />}
              {activeTab === 'bank' && <BancoPreguntasDocente />}
              {activeTab === 'addPregunta' && (
                <div className="max-w-4xl mx-auto">
                   <FormularioPreguntaDocente onSave={handleSavePregunta} onCancel={() => setActiveTab('bank')} />
                </div>
              )}
              {activeTab === 'simulacros' && <SimulacrosDocente />}
              {activeTab === 'reports' && <ReportesDocente />}
              {activeTab === 'requests' && (
                <ProtectedModule permiso="solicitarNuevasFunciones">
                  <SolicitudesFunciones />
                </ProtectedModule>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function StatsCard({ label, value, trend, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
