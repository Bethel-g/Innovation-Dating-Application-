import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/users', label: 'Users', icon: '👥' },
    { to: '/moderation', label: 'Moderation', icon: '🛡️' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">HeartSync Admin</div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-admin">
          <span className="sidebar-admin-role">{admin?.role?.replace('_', ' ').toUpperCase()}</span>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Logout</button>
      </div>
      <style>{`
        .admin-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 250px; background: var(--sidebar); color: #fff; display: flex; flex-direction: column; z-index: 100; }
        .sidebar-brand { padding: 24px; font-size: 20px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-sm); color: var(--sidebar-text); transition: all 0.2s; font-weight: 500; }
        .sidebar-link:hover, .sidebar-link.active { background: rgba(233,64,87,0.15); color: #fff; }
        .sidebar-icon { font-size: 18px; }
        .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
        .sidebar-admin { margin-bottom: 12px; }
        .sidebar-admin-role { font-size: 12px; color: var(--sidebar-text); }
        @media (max-width: 768px) {
          .admin-sidebar { width: 60px; }
          .sidebar-brand, .sidebar-admin { display: none; }
          .sidebar-link { justify-content: center; padding: 12px; }
          .sidebar-link span:not(.sidebar-icon) { display: none; }
        }
      `}</style>
    </aside>
  );
}
