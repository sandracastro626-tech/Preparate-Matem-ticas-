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

  if (user.debeCambiarContrasena) {
    return <ChangePassword />;
  }

  switch (user.rol) {
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
