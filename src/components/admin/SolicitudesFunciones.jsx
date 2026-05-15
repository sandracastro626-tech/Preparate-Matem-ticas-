import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquarePlus, Clock, CheckCircle2, AlertCircle, Plus, Send, X, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { crearNotificacion } from '../../utils/notifications';

const SolicitudesFunciones = () => {
  const { solicitudes, addSolicitud, updateSolicitud, deleteSolicitud, user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    rolRelacionado: 'docente',
    prioridad: 'media'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevaSolicitud = {
      ...formData,
      rolRelacionado: formData.rolRelacionado,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString().split('T')[0],
      respuestaAdministrador: '',
      creadoPor: user.id,
      nombreCreador: user.nombreCompleto
    };
    
    addSolicitud(nuevaSolicitud);

    // Notificar al administrador si un docente crea una solicitud
    if (user.rol === 'docente') {
      crearNotificacion({
        destinatarioRol: "administrador",
        titulo: "Nueva solicitud del docente",
        mensaje: `${user.nombreCompleto} creó una solicitud de modificación de la plataforma.`,
        tipo: "solicitud_docente",
        prioridad: formData.prioridad,
        enlace: "requests"
      });
    }

    setFormData({ titulo: '', descripcion: '', rolRelacionado: 'docente', prioridad: 'media' });
    setShowForm(false);
  };

  const handleResponder = (s) => {
    setRespondingTo(s);
    setResponse(s.respuestaAdministrador || '');
    setNewStatus(s.estado || 'en revisión');
  };

  const saveResponse = () => {
    updateSolicitud(respondingTo.id, {
      respuestaAdministrador: response,
      estado: newStatus,
      fechaRespuesta: new Date().toISOString().split('T')[0]
    });

    // Notificar al autor de la solicitud
    crearNotificacion({
      destinatarioId: respondingTo.creadoPor,
      titulo: "Solicitud respondida",
      mensaje: `Tu solicitud "${respondingTo.titulo}" ha sido marcada como ${newStatus}.`,
      tipo: "sistema",
      prioridad: "media",
      enlace: "requests"
    });

    setRespondingTo(null);
  };

  const statusIcons = {
    pendiente: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pendiente' },
    'en revisión': { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'En Revisión' },
    aprobada: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Aprobada' },
    rechazada: { icon: X, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Rechazada' },
    implementada: { icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Implementada' }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Solicitudes de Modificación</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Evolución de la Plataforma CHECK-ICFES</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest text-sm"
        >
          <Plus size={20} />
          Crear Solicitud
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[3rem] border-2 border-indigo-100 shadow-2xl w-full max-w-xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">Nueva Solicitud</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Título</label>
                    <input 
                      type="text" 
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                      placeholder="Resumen de la mejora..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción</label>
                    <textarea 
                      required
                      rows="3"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold resize-none"
                      placeholder="Detalles sobre por qué es necesaria esta modificación..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rol Relacionado</label>
                      <select 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                        value={formData.rolRelacionado}
                        onChange={(e) => setFormData({...formData, rolRelacionado: e.target.value})}
                      >
                        <option value="administrador">Administrador</option>
                        <option value="docente">Docente</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="todos">Todos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prioridad</label>
                      <select 
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                        value={formData.prioridad}
                        onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                  >
                    <Send size={20} />
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {respondingTo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-10 rounded-[3rem] border-2 border-indigo-100 shadow-2xl w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Responder Solicitud</h3>
                  <p className="text-indigo-600 font-bold text-xs">#{respondingTo.id}</p>
                </div>
                <button onClick={() => setRespondingTo(null)} className="text-slate-400 hover:text-slate-600 p-2">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <h4 className="font-black text-slate-800 mb-2">{respondingTo.titulo}</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{respondingTo.descripcion}</p>
                   <div className="mt-4 pt-4 border-t border-slate-200 flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Autor: {respondingTo.nombreCreador}</span>
                      <span>Rol: {respondingTo.rolRelacionado}</span>
                   </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Respuesta del Administrador</label>
                    <textarea 
                      rows="4"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="w-full px-6 py-5 bg-indigo-50/30 border-2 border-indigo-50 rounded-[2rem] focus:border-indigo-500 outline-none transition-all font-bold placeholder:text-indigo-200"
                      placeholder="Escribe aquí tu respuesta técnica o decisión..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado del Requerimiento</label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                       {Object.keys(statusIcons).map(status => (
                         <button
                           key={status}
                           onClick={() => setNewStatus(status)}
                           className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                             ${newStatus === status ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                         >
                           {status}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={saveResponse}
                    className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black hover:bg-slate-800 shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    <Save size={20} />
                    Guardar Respuesta
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {solicitudes.length === 0 ? (
          <div className="col-span-full bg-white p-24 rounded-[3rem] border border-dashed border-slate-200 text-center">
            <MessageSquarePlus className="mx-auto text-slate-200 mb-6" size={64} />
            <p className="text-slate-300 font-extrabold text-xl uppercase tracking-widest">No hay solicitudes para mostrar</p>
          </div>
        ) : (
          solicitudes.map(s => {
            const status = statusIcons[s.estado] || statusIcons.pendiente;
            return (
              <motion.div 
                key={s.id} 
                layout
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1 rounded-full ${
                          s.prioridad === 'alta' ? 'bg-rose-100 text-rose-600' : s.prioridad === 'media' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {s.prioridad}
                        </span>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                           <status.icon size={12} />
                           <span className="text-[9px] font-black uppercase tracking-[0.2em]">{status.label}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{s.titulo}</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.descripcion}</p>
                  
                  {s.respuestaAdministrador && (
                    <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-indigo-500 relative">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <MessageSquarePlus size={14} /> Respuesta Admin
                       </p>
                       <p className="text-sm font-bold text-slate-700 italic">"{s.respuestaAdministrador}"</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.fechaCreacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.rolRelacionado}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">De: {s.nombreCreador}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-8">
                  <button 
                    onClick={() => handleResponder(s)}
                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Responder
                  </button>
                  <button 
                    onClick={() => deleteSolicitud(s.id)}
                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SolicitudesFunciones;
