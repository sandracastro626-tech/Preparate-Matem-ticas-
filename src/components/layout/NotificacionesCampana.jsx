import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, X, Check, Trash2, Info, AlertTriangle, AlertCircle, Clock, 
  ExternalLink, BookOpen, CheckCircle2, MessageSquarePlus, Users, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  obtenerNotificacionesUsuario, 
  marcarComoLeida, 
  marcarTodasComoLeidas, 
  eliminarNotificacion, 
  formatearFechaRelativa,
  cargarNotificacionesIniciales
} from '../../utils/notifications';

export default function NotificacionesCampana({ usuarioActual, setVistaActual }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    // Cargar iniciales si no hay nada
    cargarNotificacionesIniciales();
    
    const cargar = () => {
      setNotificaciones(obtenerNotificacionesUsuario(usuarioActual));
    };

    cargar();

    // Escuchar actualizaciones
    window.addEventListener("notificacionesActualizadas", cargar);
    
    // Cerrar al hacer clic fuera
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("notificacionesActualizadas", cargar);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [usuarioActual]);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarcarLeida = (e, id) => {
    e.stopPropagation();
    marcarComoLeida(id);
  };

  const handleEliminar = (e, id) => {
    e.stopPropagation();
    eliminarNotificacion(id);
  };

  const handleMarcarTodas = () => {
    marcarTodasComoLeidas(usuarioActual);
  };

  const handleNotificacionClick = (notif) => {
    if (!notif.leida) {
      marcarComoLeida(notif.id);
    }
    setIsOpen(false);
    
    if (notif.enlace && setVistaActual) {
      setVistaActual(notif.enlace);
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return 'bg-rose-500';
      case 'alta': return 'bg-amber-500';
      case 'media': return 'bg-indigo-500';
      case 'baja': return 'bg-slate-400';
      default: return 'bg-indigo-500';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'simulacro_asignado': 
      case 'actividad_nueva':
        return <BookOpen className="text-indigo-500" size={16} />;
      case 'simulacro_realizado': 
      case 'reporte_generado':
        return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'actividad_por_vencer': return <Clock className="text-rose-500" size={16} />;
      case 'solicitud_docente': return <MessageSquarePlus className="text-amber-500" size={16} />;
      case 'actividad_estudiante': return <Users className="text-blue-500" size={16} />;
      case 'observacion_docente': return <ShieldCheck className="text-purple-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={handleToggle}
        className={`relative p-2 rounded-xl transition-all ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
            {noLeidas > 9 ? '+9' : noLeidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/50 border border-slate-100 z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Notificaciones</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {noLeidas} sin leer • {notificaciones.length} totales
                </p>
              </div>
              <button 
                onClick={handleToggle}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notificaciones.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                    <Bell size={32} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">No tienes notificaciones por el momento.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notificaciones.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificacionClick(notif)}
                      className={`p-6 hover:bg-slate-50/50 transition-all cursor-pointer group relative ${!notif.leida ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.leida ? 'bg-white shadow-sm' : 'bg-slate-50 opacity-60'}`}>
                          {getTipoIcon(notif.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(notif.prioridad)}`}></span>
                            <h4 className={`text-sm font-black truncate ${!notif.leida ? 'text-slate-800' : 'text-slate-500'}`}>
                              {notif.titulo}
                            </h4>
                          </div>
                          <p className={`text-xs leading-relaxed mb-2 ${!notif.leida ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}`}>
                            {notif.mensaje}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              <Clock size={12} /> {formatearFechaRelativa(notif.fechaCreacion)}
                            </span>
                            {notif.enlace && (
                              <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                                <ExternalLink size={10} /> {notif.enlace}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.leida && (
                          <button 
                            onClick={(e) => handleMarcarLeida(e, notif.id)}
                            className="p-1.5 bg-white text-emerald-500 rounded-lg shadow-sm border border-slate-100 hover:bg-emerald-50 transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleEliminar(e, notif.id)}
                          className="p-1.5 bg-white text-rose-500 rounded-lg shadow-sm border border-slate-100 hover:bg-rose-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              {notificaciones.length > 0 && (
                <button 
                  onClick={handleMarcarTodas}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-4 py-2"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 px-4 py-2"
              >
                Cerrar panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
