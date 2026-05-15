import React from 'react';
import { useApp } from '../../context/AppContext';

const ProtectedModule = ({ permiso, children }) => {
  const { user, permisos, modulos } = useApp();
  const rol = user?.rol;

  // Check if the permission exists and is true for this role
  const hasPermission = permisos[rol]?.[permiso];

  // Also check if the module is active if it's linked to a state
  // This is a simple implementation, you can expand it
  
  if (!hasPermission) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
        <h2 className="font-bold text-yellow-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          Acceso restringido
        </h2>
        <p className="text-yellow-700 mt-2 text-sm">
          No tienes permisos para acceder a este módulo. Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedModule;
