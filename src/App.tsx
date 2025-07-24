import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TimeEntryProvider } from './contexts/TimeEntryContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <TimeEntryProvider>
        <AppContent />
      </TimeEntryProvider>
    </AuthProvider>
  );
}

export default App;