import React, { useState } from 'react';
import { 
  Search, Filter, Edit2, Trash2, Shield, User, 
  UserCheck, UserX, Key, ChevronLeft, ChevronRight, Eye 
} from 'lucide-react';

export function TablaUsuarios({ 
  usuarios, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onResetPassword,
  onView,
  onAssignTeacher
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('TODOS');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [filterGrupo, setFilterGrupo] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extraer grupos únicos para el filtro
  const grupos = Array.from(new Set(usuarios.map(u => u.grupo).filter(g => g))).sort();

  // Filtrado
  const filteredUsers = usuarios.filter(u => {
    const matchesSearch = (
      u.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.numeroDocumento?.includes(searchTerm) ||
      u.codigoEstudiante?.includes(searchTerm)
    );
  const matchesRol = filterRol === 'TODOS' || u.rol === filterRol || u.rol === filterRol.toLowerCase();
    const matchesEstado = filterEstado === 'TODOS' || u.estado === filterEstado;
    const matchesGrupo = filterGrupo === 'TODOS' || u.grupo === filterGrupo;
    
    return matchesSearch && matchesRol && matchesEstado && matchesGrupo;
  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRolBadge = (rol) => {
    const r = rol?.toUpperCase();
    switch (r) {
      case 'ADMIN':
      case 'ADMINISTRADOR': 
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold ring-1 ring-purple-200">ADMIN</span>;
      case 'DOCENTE': 
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold ring-1 ring-indigo-200">DOCENTE</span>;
      case 'ESTUDIANTE': 
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-200">ESTUDIANTE</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ToolBar */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre, correo, documento..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
          >
            <option value="TODOS">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="DOCENTE">Docentes</option>
            <option value="ESTUDIANTE">Estudiantes</option>
          </select>
          
          <select 
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <select 
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
          >
            <option value="TODOS">Todos los grupos</option>
            {grupos.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Documento / Código</th>
              <th className="px-6 py-4">Institución / Grupo</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedUsers.length > 0 ? paginatedUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                      ${(u.rol === 'ADMIN' || u.rol === 'administrador') ? 'bg-purple-500' : (u.rol === 'DOCENTE' || u.rol === 'docente') ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                      {u.nombreCompleto?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{u.nombreCompleto}</div>
                      <div className="text-xs text-gray-500">{u.email || u.usuario}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getRolBadge(u.rol)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="text-gray-700 font-medium">{u.numeroDocumento}</div>
                  <div className="text-xs text-gray-500">{u.codigoEstudiante && `Cód: ${u.codigoEstudiante}`}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="text-gray-700 truncate max-w-[150px]">{u.institucion}</div>
                  <div className="text-xs font-bold text-indigo-600">{u.grupo || (u.gruposAsignados ? u.gruposAsignados.join(', ') : '')}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onToggleStatus(u.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all
                      ${u.estado === 'activo' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'}`}
                  >
                    {u.estado === 'activo' ? <UserCheck size={14} /> : <UserX size={14} />}
                    {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => onView(u)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    {u.rol === 'estudiante' && (
                      <button 
                        onClick={() => onAssignTeacher(u)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Asignar Docente"
                      >
                        <Shield size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => onEdit(u)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onResetPassword(u)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Cambiar contraseña"
                    >
                      <Key size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(u)}
                      disabled={u.id === 'admin_001'}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No se encontraron usuarios con los criterios de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-sm text-gray-500">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> de <span className="font-medium">{filteredUsers.length}</span> usuarios
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all
                    ${currentPage === i + 1 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
