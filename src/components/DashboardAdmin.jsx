import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Book, Award, TrendingUp, AlertTriangle, 
  ListChecks, GraduationCap, ChevronRight, BarChart3
} from 'lucide-react';
import { BarDesempeño, PieNiveles } from './Charts';
import GestionUsuarios from './UserManagement/UserManagement';
import BancoPreguntas from './admin/BancoPreguntas';
import GestionSimulacros from './admin/GestionSimulacros';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import ProtectedModule from './layout/ProtectedModule';
import ConfiguracionRoles from './admin/ConfiguracionRoles';
import ConfiguracionModulos from './admin/ConfiguracionModulos';
import SolicitudesFunciones from './admin/SolicitudesFunciones';
import ReinicioPlataforma from './admin/ReinicioPlataforma';

export default function AdminDashboard() {
  const { user, usuarios, preguntas, simulacros, intentos } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const docentes = usuarios.filter(u => u.rol === 'docente' || u.rol === 'DOCENTE');
  const estudiantes = usuarios.filter(u => u.rol === 'estudiante' || u.rol === 'ESTUDIANTE');
  
  const preguntasVisibles = preguntas.filter(p => p.estado !== 'eliminada');
  const simulacrosVisibles = simulacros.filter(s => s.estado !== 'eliminado');
  
  const stats = [
    { label: 'Estudiantes', value: estudiantes.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Docentes', value: docentes.length, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Preguntas', value: preguntasVisibles.length, icon: Book, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Simulacros', value: simulacrosVisibles.length, icon: ListChecks, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const getPageContext = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Panel General', subtitle: 'Resumen global del desempeño académico' };
      case 'users': return { title: 'Gestión de Usuarios', subtitle: 'Administración de docentes y estudiantes' };
      case 'bank': return { title: 'Banco de Preguntas', subtitle: 'Repositorio de ítems Matemáticas Saber 11°' };
      case 'simulacros': return { title: 'Simulacros', subtitle: 'Creación y seguimiento de exámenes' };
      case 'roles': return { title: 'Configuración de Roles', subtitle: 'Matriz de permisos y accesibilidad' };
      case 'modules': return { title: 'Configuración de Módulos', subtitle: 'Activar o desactivar funciones' };
      case 'requests': return { title: 'Solicitudes', subtitle: 'Buzón de requerimientos funcionales' };
      case 'reset': return { title: 'Reinicio de Plataforma', subtitle: 'Limpiar datos de prueba y preparar para uso real' };
      default: return { title: 'Panel Admin', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageContext();

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} user={user} onNavigate={setActiveTab} />
        
        <main className="p-10 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <s.icon size={28} />
                    </div>
                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{s.label}</h3>
                    <p className="text-4xl font-black text-slate-800 tracking-tight">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <TrendingUp size={20} />
                      </div>
                      Distribución de Niveles
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    <PieNiveles data={[
                      { name: 'Bajo', value: 15 },
                      { name: 'Básico', value: 30 },
                      { name: 'Alto', value: 35 },
                      { name: 'Superior', value: 20 },
                    ]} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nivel Promedio</p>
                      <p className="font-black text-slate-800">Básico / Alto</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tendencia</p>
                      <p className="font-black text-green-600 flex items-center gap-1">
                        Subiendo (+5%)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <AlertTriangle size={20} />
                      </div>
                      Competencias Críticas
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    <BarDesempeño data={[
                      { name: 'Interpretación', porcentaje: 55 },
                      { name: 'Formulación', porcentaje: 62 },
                      { name: 'Argumentación', porcentaje: 48 },
                    ]} />
                  </div>
                  <p className="mt-6 text-sm text-slate-400 font-medium text-center">
                    La competencia de <span className="font-black text-slate-600">Argumentación</span> requiere refuerzo prioritario.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <ProtectedModule permiso="gestionUsuarios">
              <div className="animate-in fade-in duration-500">
                <GestionUsuarios />
              </div>
            </ProtectedModule>
          )}

          {activeTab === 'bank' && (
            <ProtectedModule permiso="bancoPreguntas">
              <div className="animate-in fade-in duration-500">
                <BancoPreguntas />
              </div>
            </ProtectedModule>
          )}

          {activeTab === 'simulacros' && (
            <ProtectedModule permiso="crearSimulacros">
              <div className="animate-in fade-in duration-500">
                <GestionSimulacros />
              </div>
            </ProtectedModule>
          )}

          {activeTab === 'roles' && (
            <ProtectedModule permiso="gestionarRoles">
              <ConfiguracionRoles />
            </ProtectedModule>
          )}

          {activeTab === 'modules' && (
            <ProtectedModule permiso="gestionarModulos">
              <ConfiguracionModulos />
            </ProtectedModule>
          )}

          {activeTab === 'requests' && (
            <ProtectedModule permiso="solicitarNuevasFunciones">
              <SolicitudesFunciones />
            </ProtectedModule>
          )}

          {activeTab === 'reset' && (
            <ProtectedModule permiso="limpiarDatosPrueba">
              <ReinicioPlataforma />
            </ProtectedModule>
          )}
        </main>
      </div>
    </div>
  );
}
