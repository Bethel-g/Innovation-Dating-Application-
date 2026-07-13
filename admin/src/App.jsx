import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Posts from './pages/Posts';
import Comments from './pages/Comments';
import Communities from './pages/Communities';
import Projects from './pages/Projects';
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
          <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/comments" element={<ProtectedRoute><Comments /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
      </div>
      <style>{`
        .admin-app { display: flex; min-height: 100vh; background: #f5f7fb; }
        .admin-content { flex: 1; margin-left: 250px; padding: 28px; background: #f5f7fb; min-height: 100vh; }
        .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f7fb; }
        @media (max-width: 768px) { .admin-content { margin-left: 0; padding: 16px; } }
      `}</style>
    </div>
  );
}
