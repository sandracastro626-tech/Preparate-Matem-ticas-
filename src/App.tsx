import React from 'react';
import { useApp, AppProvider } from './context/AppContext';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardDocente from './components/DashboardDocente';
import DashboardEstudiante from './components/DashboardEstudiante';
import ChangePassword from './components/ChangePassword';

function AppContent() {
  const { user } = useApp();

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
