import React from 'react';
import { useApp, AppProvider } from './context/AppContext';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardDocente from './components/DashboardDocente';
import DashboardEstudiante from './components/DashboardEstudiante';
import ChangePassword from './components/ChangePassword';

function AppContent() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const rol = String(user.rol || "").toLowerCase();

  if (user.debeCambiarContrasena && rol === 'administrador') {
    return <ChangePassword />;
  }

  switch (rol) {
    case 'ADMIN':
    case 'administrador':
      return <DashboardAdmin />;
    case 'DOCENTE':
    case 'docente':
      return <DashboardDocente />;
    case 'ESTUDIANTE':
    case 'estudiante':
      return <DashboardEstudiante />;
    default:
      return <Login />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
