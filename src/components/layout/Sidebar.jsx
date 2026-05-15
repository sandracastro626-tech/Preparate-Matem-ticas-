import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Home, 
  PlusCircle, 
  LayoutGrid,
  MessageSquarePlus,
  ShieldCheck,
  FileText,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, permisos } = useApp();
  const rol = user?.rol;

  const menuItems = {
    administrador: [
      { id: 'overview', label: 'Inicio', icon: Home, permission: 'verResultadosGlobales' },
      { id: 'users', label: 'Gestión Usuarios', icon: Users, permission: 'gestionUsuarios' },
      { id: 'bank', label: 'Banco Preguntas', icon: BookOpen, permission: 'bancoPreguntas' },
      { id: 'simulacros', label: 'Simulacros', icon: ClipboardList, permission: 'crearSimulacros' },
      { id: 'roles', label: 'Config. Roles', icon: ShieldCheck, permission: 'gestionarRoles' },
      { id: 'modules', label: 'Config. Módulos', icon: Settings, permission: 'gestionarModulos' },
      { id: 'requests', label: 'Solicitudes', icon: MessageSquarePlus, permission: 'solicitarNuevasFunciones' },
      { id: 'reset', label: 'Reiniciar Datos', icon: RotateCcw, permission: 'limpiarDatosPrueba' },
    ],
    docente: [
      { id: 'overview', label: 'Inicio', icon: Home, permission: 'verResultadosGrupales' },
      { id: 'groups', label: 'Mis Grupos', icon: LayoutGrid, permission: 'verResultadosGrupales' },
      { id: 'students', label: 'Mis Estudiantes', icon: Users, permission: 'verResultadosIndividuales' },
      { id: 'bank', label: 'Banco Preguntas', icon: BookOpen, permission: 'bancoPreguntas' },
      { id: 'addPregunta', label: 'Crear Pregunta', icon: PlusCircle, permission: 'crearPreguntas' },
      { id: 'simulacros', label: 'Simulacros', icon: ClipboardList, permission: 'crearSimulacros' },
      { id: 'reports', label: 'Reportes', icon: FileText, permission: 'verResultadosGrupales' },
      { id: 'requests', label: 'Solicitudes', icon: MessageSquarePlus, permission: 'solicitarNuevasFunciones' },
    ],
    estudiante: [
      { id: 'overview', label: 'Inicio', icon: Home, permission: 'verResultadosIndividuales' },
      { id: 'misSimulacros', label: 'Mis Simulacros', icon: ClipboardList, permission: 'presentarSimulacros' },
      { id: 'resultados', label: 'Mis Resultados', icon: BarChart3, permission: 'verReporteIndividual' },
      { id: 'reporte', label: 'Reporte Individual', icon: FileText, permission: 'verReporteIndividual' },
      { id: 'feedback', label: 'Retroalimentación', icon: MessageSquarePlus, permission: 'verRetroalimentacion' },
      { id: 'recomendaciones', label: 'Recomendaciones', icon: ShieldCheck, permission: 'verRetroalimentacion' },
    ]
  };

  const currentMenu = menuItems[rol] || [];

  return (
    <div className="w-72 bg-[#0f172a] text-white h-screen flex flex-col sticky top-0 overflow-y-auto">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-900/20">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight block leading-none">CHECK-ICFES</span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Matemáticas</span>
          </div>
        </div>

        <nav className="space-y-2">
          {currentMenu.map((item) => {
            if (permisos[rol] && !permisos[rol][item.permission]) return null;

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all group ${
                  isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5 space-y-6">
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Usuario</p>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${rol === 'administrador' ? 'bg-indigo-600' : rol === 'docente' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              {user?.nombreCompleto?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{user?.nombreCompleto}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user?.rol}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-red-600 hover:text-white transition-all group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
