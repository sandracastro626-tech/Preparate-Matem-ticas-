import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, leerStorage } from '../utils/storageGlobal';

export function useDatosGlobales() {
  const [data, setData] = useState({
    usuarios: leerStorage(STORAGE_KEYS.usuarios, []),
    preguntas: leerStorage(STORAGE_KEYS.preguntas, []),
    simulacros: leerStorage(STORAGE_KEYS.simulacros, []),
    resultados: leerStorage(STORAGE_KEYS.resultados, []),
    notificaciones: leerStorage(STORAGE_KEYS.notificaciones, []),
    usuarioActual: leerStorage(STORAGE_KEYS.usuarioActual, null),
    modulosPlataforma: leerStorage(STORAGE_KEYS.modulosPlataforma, []),
    permisosPorRol: leerStorage(STORAGE_KEYS.permisosPorRol, {})
  });

  const refreshData = useCallback(() => {
    setData({
      usuarios: leerStorage(STORAGE_KEYS.usuarios, []),
      preguntas: leerStorage(STORAGE_KEYS.preguntas, []),
      simulacros: leerStorage(STORAGE_KEYS.simulacros, []),
      resultados: leerStorage(STORAGE_KEYS.resultados, []),
      notificaciones: leerStorage(STORAGE_KEYS.notificaciones, []),
      usuarioActual: leerStorage(STORAGE_KEYS.usuarioActual, null),
      modulosPlataforma: leerStorage(STORAGE_KEYS.modulosPlataforma, []),
      permisosPorRol: leerStorage(STORAGE_KEYS.permisosPorRol, {})
    });
  }, []);

  useEffect(() => {
    const handleGlobalUpdate = () => {
      refreshData();
    };

    const handleStorageChange = (e) => {
      if (Object.values(STORAGE_KEYS).includes(e.key)) {
        refreshData();
      }
    };

    window.addEventListener('datosGlobalesActualizados', handleGlobalUpdate);
    window.addEventListener('preguntasActualizadas', handleGlobalUpdate);
    window.addEventListener('simulacrosActualizados', handleGlobalUpdate);
    window.addEventListener('usuariosActualizados', handleGlobalUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('datosGlobalesActualizados', handleGlobalUpdate);
      window.removeEventListener('preguntasActualizadas', handleGlobalUpdate);
      window.removeEventListener('simulacrosActualizados', handleGlobalUpdate);
      window.removeEventListener('usuariosActualizados', handleGlobalUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData]);

  return { ...data, refreshData };
}
