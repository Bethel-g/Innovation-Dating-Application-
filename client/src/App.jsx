import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import IdeaRooms from './pages/IdeaRooms';
import Mentors from './pages/Mentors';
import Search from './pages/Search';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminModeration from './pages/admin/AdminModeration';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!['admin', 'moderator', 'support'].includes(user.role)) return <Navigate to="/matches" />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return children;
  return <Navigate to={['admin', 'moderator', 'support'].includes(user.role) ? '/admin' : '/feed'} />;
}

export default function App() {
  const { user, hydrateSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = ['admin', 'moderator', 'support'].includes(user?.role);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const redirectParam = params.get('redirect');

    if (!token || !userParam) return;

    try {
      const parsedUser = JSON.parse(decodeURIComponent(userParam));
      hydrateSession(token, parsedUser);
      const targetPath = redirectParam || (['admin', 'moderator', 'support'].includes(parsedUser?.role) ? '/admin' : '/matches');
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('Failed to hydrate auth session', err);
    }
  }, [hydrateSession, location.search, navigate]);

  return (
    <div className="app">
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat/:matchId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/ideas" element={<ProtectedRoute><IdeaRooms /></ProtectedRoute>} />
          <Route path="/mentors" element={<ProtectedRoute><Mentors /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><AdminModeration /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
}
