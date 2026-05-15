import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function FormularioDocente({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    email: '',
    telefono: '',
    institucion: '',
    area: 'Matemáticas',
    usuario: '',
    contrasena: '',
    estado: 'activo',
    gruposAsignados: [],
    rol: 'docente'
  });

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGruposChange = (e) => {
    const value = e.target.value;
    const groups = value.split(',').map(g => g.trim()).filter(g => g !== '');
    setFormData(prev => ({ ...prev, gruposAsignados: groups }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombreCompleto || !formData.email || !formData.numeroDocumento) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    if (!user && formData.contrasena.length < 8) {
      alert("La contraseña temporal debe tener al menos 8 caracteres.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-600 text-white">
          <h3 className="text-xl font-bold">{user ? 'Editar Docente' : 'Registrar Nuevo Docente'}</h3>
          <button onClick={onCancel} className="hover:bg-white/20 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input 
                type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
              <select 
                name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PP">Pasaporte</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento *</label>
              <input 
                type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institución Educativa *</label>
              <input 
                type="text" name="institucion" value={formData.institucion} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área o Asignatura</label>
              <input 
                type="text" name="area" value={formData.area} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input 
                type="text" name="usuario" value={formData.usuario} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal *</label>
                <input 
                  type="password" name="contrasena" value={formData.contrasena} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                name="estado" value={formData.estado} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupos Asignados (separados por coma)</label>
              <input 
                type="text" name="gruposAsignados" value={formData.gruposAsignados.join(', ')} onChange={handleGruposChange}
                placeholder="Ej: 11A, 11B"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 font-semibold">
            <button 
              type="button" onClick={onCancel}
              className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              {user ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FormularioEstudiante({ user, onSave, onCancel, docentes = [] }) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    email: '',
    codigoEstudiante: '',
    grado: '11',
    grupo: '',
    institucion: '',
    docenteAsignado: '',
    usuario: '',
    contrasena: '',
    estado: 'activo',
    rol: 'estudiante'
  });

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombreCompleto || !formData.codigoEstudiante || !formData.grupo || !formData.institucion) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    if (!user && formData.contrasena.length < 8) {
      alert("La contraseña temporal debe tener al menos 8 caracteres.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-600 text-white">
          <h3 className="text-xl font-bold">{user ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}</h3>
          <button onClick={onCancel} className="hover:bg-white/20 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input 
                type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
              <select 
                name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="RC">Registro Civil</option>
                <option value="CE">Cédula de Extranjería</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento *</label>
              <input 
                type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Estudiante *</label>
              <input 
                type="text" name="codigoEstudiante" value={formData.codigoEstudiante} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
              <select 
                name="grado" value={formData.grado} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="10">10°</option>
                <option value="11">11°</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso o Grupo *</label>
              <input 
                type="text" name="grupo" value={formData.grupo} onChange={handleChange}
                placeholder="Ej: 11A"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institución Educativa *</label>
              <input 
                type="text" name="institucion" value={formData.institucion} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Docente Asignado</label>
              <select 
                name="docenteAsignado" value={formData.docenteAsignado} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Seleccionar docente</option>
                {docentes.map(d => (
                  <option key={d.id} value={d.id}>{d.nombreCompleto}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (opcional)</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input 
                type="text" name="usuario" value={formData.usuario} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal *</label>
                <input 
                  type="password" name="contrasena" value={formData.contrasena} onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                name="estado" value={formData.estado} onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 font-semibold">
            <button 
              type="button" onClick={onCancel}
              className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              {user ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
