import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layout, CheckCircle2, XCircle, Edit3, Trash2, Plus, Search } from 'lucide-react';

const ConfiguracionModulos = () => {
  const { modulos, updateModulo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModulos = modulos.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEstado = (id, current) => {
    updateModulo(id, { estado: current === 'activo' ? 'inactivo' : 'activo' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar módulo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={20} />
          Nuevo Módulo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModulos.map(modulo => (
          <div key={modulo.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-2xl ${
                modulo.estado === 'activo' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
              } transition-colors`}>
                <Layout size={24} />
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => toggleEstado(modulo.id, modulo.estado)}
                  className={`p-2 rounded-xl transition-all ${
                    modulo.estado === 'activo' ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {modulo.estado === 'activo' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-800">{modulo.nombre}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  modulo.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {modulo.estado}
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium mb-4">{modulo.descripcion}</p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Acceso:</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  modulo.rolAutorizado === 'administrador' ? 'bg-purple-50 text-purple-600' : 
                  modulo.rolAutorizado === 'docente' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {modulo.rolAutorizado}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModulos.length === 0 && (
        <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <Layout size={40} />
          </div>
          <p className="text-slate-400 font-bold mb-2">No se encontraron módulos</p>
          <button onClick={() => setSearchTerm('')} className="text-indigo-600 text-sm font-bold hover:underline">Limpiar búsqueda</button>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionModulos;
