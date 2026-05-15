import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Save, Check, X } from 'lucide-react';

const ConfiguracionRoles = () => {
  const { permisos, updatePermisos } = useApp();
  const [localPermisos, setLocalPermisos] = useState({ ...permisos });
  const [saved, setSaved] = useState(false);

  const roles = ['administrador', 'docente', 'estudiante'];
  const permisoKeys = Object.keys(permisos.administrador);

  const handleToggle = (rol, key) => {
    // Critical permissions protection for admin
    const criticalAdminPerms = ['gestionUsuarios', 'gestionarRoles', 'gestionarModulos'];
    if (rol === 'administrador' && criticalAdminPerms.includes(key)) {
      alert('Este permiso es obligatorio para el administrador y no puede desactivarse para garantizar el acceso al sistema.');
      return;
    }

    setLocalPermisos(prev => ({
      ...prev,
      [rol]: {
        ...prev[rol],
        [key]: !prev[rol][key]
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    updatePermisos(localPermisos);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Matriz de Permisos</h2>
            <p className="text-slate-400 text-sm">Controla qué puede hacer cada rol en la plataforma</p>
          </div>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {saved ? <Check size={20} /> : <Save size={20} />}
            {saved ? 'Guardado' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Permiso / Función</th>
                {roles.map(rol => (
                  <th key={rol} className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Shield size={16} className={rol === 'administrador' ? 'text-purple-500' : rol === 'docente' ? 'text-indigo-500' : 'text-blue-500'} />
                      {rol}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {permisoKeys.map(key => (
                <tr key={key} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </td>
                  {roles.map(rol => (
                    <td key={rol} className="p-6 text-center">
                      <button 
                        onClick={() => handleToggle(rol, key)}
                        disabled={rol === 'administrador' && key === 'gestionarRoles'} // Prevent lockout
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          localPermisos[rol][key] ? 'bg-indigo-500' : 'bg-slate-200'
                        } ${rol === 'administrador' && key === 'gestionarRoles' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:ring-4 hover:ring-indigo-100'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          localPermisos[rol][key] ? 'left-7 shadow-sm' : 'left-1'
                        }`} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4 items-start">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500">
          <Shield size={24} />
        </div>
        <div>
          <h3 className="font-bold text-amber-800">Nota de seguridad</h3>
          <p className="text-amber-700 text-sm mt-1 leading-relaxed">
            Cambiar los permisos afectará inmediatamente la experiencia de los usuarios al recargar o navegar. 
            Asegúrate de no desactivar funciones críticas que puedan impedir el flujo académico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionRoles;
