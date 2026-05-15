import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserPlus, GraduationCap, Shield,
  Search, Filter, Edit2, Trash2, Key, X, AlertCircle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TablaUsuarios } from './UserTable';
import { FormularioDocente, FormularioEstudiante } from './UserForms';
import ModalCambiarContrasena from './ModalCambiarContrasena';

const GestionUsuarios = () => {
  const { 
    user,
    usuarios, updateUsuario, deleteUsuario, 
    toggleUserStatus, registerUser, changePassword,
    asignarDocenteAEstudiante, asignarDocenteAGrupo
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showFormDocente, setShowFormDocente] = useState(false);
  const [showFormEstudiante, setShowFormEstudiante] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Stats
  const totalUsuarios = Array.isArray(usuarios) ? usuarios.length : 0;
  const totalDocentes = Array.isArray(usuarios) ? usuarios.filter(u => u.rol === 'docente').length : 0;
  const totalEstudiantes = Array.isArray(usuarios) ? usuarios.filter(u => u.rol === 'estudiante').length : 0;
  const totalActivos = Array.isArray(usuarios) ? usuarios.filter(u => u.estado === 'activo').length : 0;

  const handleFeedback = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleSaveUser = (data) => {
    try {
      if (editingUser) {
        const res = updateUsuario(editingUser.id, data);
        if (res.success) handleFeedback('success', 'Usuario actualizado correctamente.');
        else handleFeedback('error', res.message);
      } else {
        const res = registerUser(data);
        if (res.success) handleFeedback('success', 'Usuario creado correctamente.');
        else handleFeedback('error', res.message);
      }
      setShowFormDocente(false);
      setShowFormEstudiante(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      handleFeedback('error', 'Ocurrió un error inesperado al guardar el usuario.');
    }
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    try {
      const res = deleteUsuario(userToDelete.id);
      if (res.success) handleFeedback('success', 'Usuario eliminado.');
      else handleFeedback('error', res.message);
      setUserToDelete(null);
    } catch (err) {
      handleFeedback('error', 'Error al eliminar usuario.');
    }
  };

  const handleSaveNewPassword = (userId, newPassword) => {
    try {
      changePassword(userId, newPassword);
      setChangingPasswordUser(null);
      handleFeedback('success', 'Contraseña actualizada.');
    } catch (err) {
      handleFeedback('error', 'Error al cambiar contraseña.');
    }
  };

  // Error boundary simulation for components
  if (error && !usuarios) {
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-red-50 p-8 text-center border-2 border-red-100">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800">No fue posible cargar Gestión de usuarios</h2>
          <p className="text-red-600 mt-2">Ha ocurrido un error al intentar leer los datos del sistema.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={18} />
            Recargar plataforma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de usuarios</h1>
          <p className="text-slate-500 font-medium">Administra las cuentas de docentes y estudiantes registrados.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingUser(null); setShowFormDocente(true); }}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} />
            Crear Docente
          </button>
          <button 
            onClick={() => { setEditingUser(null); setShowFormEstudiante(true); }}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} />
            Crear Estudiante
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Usuarios', val: totalUsuarios, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Docentes', val: totalDocentes, icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Estudiantes', val: totalEstudiantes, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Usuarios Activos', val: totalActivos, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
              <s.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm"
          >
            <CheckCircle2 size={20} />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <TablaUsuarios 
          usuarios={usuarios}
          onEdit={(u) => { setEditingUser(u); if(u.rol === 'docente') setShowFormDocente(true); else setShowFormEstudiante(true); }}
          onDelete={setUserToDelete}
          onToggleStatus={toggleUserStatus}
          onResetPassword={setChangingPasswordUser}
          onView={() => {}}
          onAssignTeacher={(u) => asignarDocenteAEstudiante(u.id, '')} // Placeholder integration
        />
      </div>

      {/* Modals */}
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
          onSave={handleSaveUser} 
          onCancel={() => { setShowFormEstudiante(false); setEditingUser(null); }} 
          docentes={usuarios.filter(u => u.rol === 'docente')}
        />
      )}

      {changingPasswordUser && (
        <ModalCambiarContrasena 
          usuario={changingPasswordUser}
          onSave={handleSaveNewPassword}
          onCancel={() => setChangingPasswordUser(null)}
        />
      )}

      {/* Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">¿Eliminar usuario?</h3>
            <p className="text-slate-500 mb-8 font-medium">Esta acción no se puede deshacer. Se borrarán todos los datos asociados.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px] hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 uppercase tracking-widest text-[10px] hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
