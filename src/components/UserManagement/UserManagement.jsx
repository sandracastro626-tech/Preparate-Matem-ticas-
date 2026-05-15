import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserPlus, UserRound, GraduationCap, Shield,
  Download, Upload, AlertCircle, CheckCircle2, Trash2, X, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TablaUsuarios } from './UserTable';
import { FormularioDocente, FormularioEstudiante } from './UserForms';
import { ImportarUsuarios } from './ImportUsers';
import { exportToCSV, exportToExcel, formatUsersForExport } from './ExportUtils';
import ModalCambiarContrasena from './ModalCambiarContrasena';
import { crearNotificacion } from '../../utils/notifications';

export default function GestionUsuarios() {
  const { 
    user,
    usuarios, updateUsuario, deleteUsuario, 
    toggleUserStatus, registerUser, resetPassword, changePassword,
    bulkImportUsers, asignarDocenteAEstudiante, asignarDocenteAGrupo
  } = useApp();

  const [showFormDocente, setShowFormDocente] = useState(false);
  const [showFormEstudiante, setShowFormEstudiante] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGroupAssignModal, setShowGroupAssignModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [assigningTo, setAssigningTo] = useState(null);
  const [selectedDocente, setSelectedDocente] = useState('');
  const [groupAssignData, setGroupAssignData] = useState({ institucion: '', grupo: '', docenteId: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [message, setMessage] = useState(null);

  const docentes = usuarios.filter(u => u.rol === 'docente' || u.rol === 'DOCENTE');
  const estudiantes = usuarios.filter(u => u.rol === 'estudiante' || u.rol === 'ESTUDIANTE');
  const activos = usuarios.filter(u => u.estado === 'activo');
  const inactivos = usuarios.filter(u => u.estado === 'inactivo');

  const showFeedback = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveUser = (data) => {
    if (editingUser) {
      updateUsuario(editingUser.id, data);
      showFeedback('success', 'Usuario actualizado correctamente.');
    } else {
      const res = registerUser(data);
      if (res.success) {
        showFeedback('success', 'Usuario creado correctamente.');
      } else {
        showFeedback('error', res.message);
        return;
      }
    }
    setShowFormDocente(false);
    setShowFormEstudiante(false);
    setEditingUser(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    const r = user.rol?.toUpperCase();
    if (r === 'DOCENTE') setShowFormDocente(true);
    else if (r === 'ESTUDIANTE') setShowFormEstudiante(true);
  };

  const handleDelete = (usuario) => {
    if (!usuario || !usuario.id) {
      showFeedback('error', 'No se pudo identificar el usuario seleccionado.');
      return;
    }

    if (usuario.id === user.id) {
      showFeedback('error', 'No puedes eliminar tu propia cuenta mientras tienes una sesión activa.');
      return;
    }

    if (usuario.id === 'admin_001') {
      showFeedback('error', 'El administrador principal del sistema no puede ser eliminado.');
      return;
    }

    setUserToDelete(usuario);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    const res = deleteUsuario(userToDelete.id);
    if (res.success) {
      showFeedback('success', `Usuario ${userToDelete.nombreCompleto} eliminado correctamente.`);
    } else {
      showFeedback('error', res.message || 'No fue posible eliminar el usuario. Intente nuevamente.');
    }
    
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleResetPassword = (user) => {
    setChangingPasswordUser(user);
  };

  const handleSaveNewPassword = (userId, newPassword) => {
    changePassword(userId, newPassword);
    setChangingPasswordUser(null);
    showFeedback('success', 'Contraseña actualizada correctamente.');
  };

  const handleExportCSV = () => {
    const formatted = formatUsersForExport(usuarios);
    exportToCSV(formatted, `usuarios_checkicfes_${new Date().toISOString().split('T')[0]}`);
  };

  const handleAssignToGroup = () => {
    if (!groupAssignData.institucion || !groupAssignData.grupo || !groupAssignData.docenteId) {
      showFeedback('error', 'Por favor complete todos los campos.');
      return;
    }

    const res = asignarDocenteAGrupo(groupAssignData.institucion, groupAssignData.grupo, groupAssignData.docenteId);
    if (res.success) {
      const docente = usuarios.find(u => u.id === groupAssignData.docenteId);
      crearNotificacion({
        destinatarioId: groupAssignData.docenteId,
        destinatarioRol: "docente",
        titulo: "Nuevo grupo asignado",
        mensaje: `Se te asignó el seguimiento del grupo ${groupAssignData.grupo} de ${groupAssignData.institucion}.`,
        tipo: "sistema",
        prioridad: "media",
        enlace: "mis_grupos"
      });
      showFeedback('success', `Docente asignado correctamente al grupo ${groupAssignData.grupo}.`);
      setShowGroupAssignModal(false);
      setGroupAssignData({ institucion: '', grupo: '', docenteId: '' });
    }
  };

  const confirmAssignment = () => {
    if (!selectedDocente || !assigningTo) return;

    const res = asignarDocenteAEstudiante(assigningTo.id, selectedDocente);
    if (res.success) {
      showFeedback('success', 'Docente asignado correctamente al estudiante.');
      setShowAssignModal(false);
      setAssigningTo(null);
      setSelectedDocente('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-gray-500">Administra las cuentas de docentes y estudiantes de la plataforma</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setEditingUser(null); setShowFormDocente(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-sm"
          >
            <UserPlus size={18} />
            Crear Docente
          </button>
          <button 
            onClick={() => { setEditingUser(null); setShowFormEstudiante(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-sm"
          >
            <UserPlus size={18} />
            Crear Estudiante
          </button>
          <button 
            onClick={() => setShowGroupAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-sm"
          >
            <Briefcase size={18} />
            Asignar a Grupo
          </button>
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm"
          >
            <Upload size={18} />
            Importar
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-all shadow-sm">
              <Download size={18} />
              Exportar
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 w-40">
                <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">CSV</button>
                <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium">Excel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Usuarios', val: usuarios.length, color: 'text-red-600', bg: 'bg-red-50' },
          { icon: UserRound, label: 'Docentes', val: docentes.length, color: 'text-red-600', bg: 'bg-red-50' },
          { icon: GraduationCap, label: 'Estudiantes', val: estudiantes.length, color: 'text-red-600', bg: 'bg-red-50' },
          { icon: CheckCircle2, label: 'Cuentas Activas', val: activos.length, color: 'text-green-600', bg: 'bg-green-50' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feedback Message */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium text-sm">{message.text}</p>
        </motion.div>
      )}

      {/* Users Table */}
      <TablaUsuarios 
        usuarios={usuarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={toggleUserStatus}
        onResetPassword={handleResetPassword}
        onView={setViewingUser}
        onAssignTeacher={(estudiante) => {
          setAssigningTo(estudiante);
          setSelectedDocente(estudiante.docenteAsignado || '');
          setShowAssignModal(true);
        }}
      />

      <AnimatePresence>
        {/* Modal de Asignación Individual */}
        {showAssignModal && assigningTo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">Asignar Docente</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estudiante</p>
                <p className="text-sm font-bold text-slate-700">{assigningTo.nombreCompleto}</p>
                <p className="text-[10px] text-slate-400">{assigningTo.institucion} • {assigningTo.grupo}</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Docente</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  value={selectedDocente}
                  onChange={(e) => setSelectedDocente(e.target.value)}
                >
                  <option value="">Sin docente asignado</option>
                  {docentes.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.nombreCompleto}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs hover:bg-slate-50">Cancelar</button>
                <button onClick={confirmAssignment} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs hover:bg-indigo-700">Guardar</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Asignación por Grupo */}
        {showGroupAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">Asignar a Grupo</h3>
                <button onClick={() => setShowGroupAssignModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institución</label>
                  <select 
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                    value={groupAssignData.institucion}
                    onChange={(e) => setGroupAssignData({...groupAssignData, institucion: e.target.value})}
                  >
                    <option value="">Seleccione Institución</option>
                    {[...new Set(usuarios.map(u => u.institucion).filter(i => i))].map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grupo</label>
                  <select 
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                    value={groupAssignData.grupo}
                    onChange={(e) => setGroupAssignData({...groupAssignData, grupo: e.target.value})}
                  >
                    <option value="">Seleccione Grupo</option>
                    {[...new Set(usuarios.filter(u => u.institucion === groupAssignData.institucion).map(u => u.grupo).filter(g => g))].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Docente a Asignar</label>
                  <select 
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                    value={groupAssignData.docenteId}
                    onChange={(e) => setGroupAssignData({...groupAssignData, docenteId: e.target.value})}
                  >
                    <option value="">Seleccione Docente</option>
                    {docentes.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.nombreCompleto}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowGroupAssignModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs hover:bg-slate-50">Cancelar</button>
                <button onClick={handleAssignToGroup} className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-100 uppercase tracking-widest text-xs hover:bg-amber-700">Asignar Grupo</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {changingPasswordUser && (
        <ModalCambiarContrasena 
          usuario={changingPasswordUser}
          onSave={handleSaveNewPassword}
          onCancel={() => setChangingPasswordUser(null)}
        />
      )}
      {showFormDocente && (
        <FormularioDocente 
          user={editingUser} 
          onSave={handleSaveUser} 
          onCancel={() => { setShowFormDocente(false); setEditingUser(null); }} 
        />
      )}

      {showFormEstudiante && (
        <FormularioEstudiante 
          user={editingUser} 
          docentes={docentes}
          onSave={handleSaveUser} 
          onCancel={() => { setShowFormEstudiante(false); setEditingUser(null); }} 
        />
      )}

      {showImport && (
        <ImportarUsuarios 
          onImport={bulkImportUsers}
          onCancel={() => setShowImport(false)}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Confirmar eliminación</h2>
              <p className="mt-2 text-gray-600">
                ¿Está seguro de que desea eliminar permanentemente a este usuario?
              </p>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                    ${(userToDelete.rol === 'ADMIN' || userToDelete.rol === 'administrador') ? 'bg-purple-500' : (userToDelete.rol === 'DOCENTE' || userToDelete.rol === 'docente') ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                    {userToDelete.nombreCompleto?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 leading-none">{userToDelete.nombreCompleto}</p>
                    <p className="text-sm text-gray-500 mt-1 uppercase">{userToDelete.rol}</p>
                  </div>
                </div>
              </div>
              
              <p className="mt-6 text-sm text-red-500 font-bold bg-red-50 py-2 rounded-lg">
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="flex gap-3 p-6 bg-gray-50">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 text-white bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Eliminar usuario
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View User Detail Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
              <h3 className="text-xl font-bold">Detalles del Usuario</h3>
              <button onClick={() => setViewingUser(null)} className="hover:bg-white/20 p-1 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold
                  ${(viewingUser.rol === 'ADMIN' || viewingUser.rol === 'administrador') ? 'bg-purple-500' : (viewingUser.rol === 'DOCENTE' || viewingUser.rol === 'docente') ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                  {viewingUser.nombreCompleto?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{viewingUser.nombreCompleto}</h4>
                  <p className="text-gray-500 font-medium uppercase">{viewingUser.rol}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 text-sm font-semibold">
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">Correo Electrónico</p>
                  <p className="text-gray-800">{viewingUser.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">Usuario</p>
                  <p className="text-gray-800">{viewingUser.usuario || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">{viewingUser.tipoDocumento || 'Documento'}</p>
                  <p className="text-gray-800">{viewingUser.numeroDocumento}</p>
                </div>
                {viewingUser.codigoEstudiante && (
                  <div>
                    <p className="text-gray-400 font-medium mb-0.5">Código Estudiante</p>
                    <p className="text-gray-800">{viewingUser.codigoEstudiante}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">Institución</p>
                  <p className="text-gray-800">{viewingUser.institucion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">Grupo</p>
                  <p className="text-gray-800">{viewingUser.grupo || (viewingUser.gruposAsignados ? viewingUser.gruposAsignados.join(', ') : 'N/A')}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">Estado</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                    ${viewingUser.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {viewingUser.estado?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-0.5">Fecha Registro</p>
                  <p className="text-gray-800">{viewingUser.fechaCreacion}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setViewingUser(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
