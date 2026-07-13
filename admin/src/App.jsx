import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Moderation from './pages/Moderation';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return admin ? children : <Navigate to="/" />;
}

export default function App() {
  const { admin } = useAuth();

  return (
    <div className="admin-app">
      {admin && <Sidebar />}
      <div className={admin ? 'admin-content' : ''}>
        <Routes>
          <Route path="/" element={admin ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
      </div>
      <style>{`
        .admin-app { display: flex; min-height: 100vh; }
        .admin-content { flex: 1; margin-left: 250px; padding: 24px; background: var(--bg); min-height: 100vh; }
        @media (max-width: 768px) { .admin-content { margin-left: 0; padding: 16px; } }
      `}</style>
    </div>
  );
}
