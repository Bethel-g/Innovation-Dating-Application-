import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/users', label: 'Users', icon: '👥' },
    { to: '/posts', label: 'Posts', icon: '📝' },
    { to: '/comments', label: 'Comments', icon: '💬' },
    { to: '/communities', label: 'Communities', icon: '🏛️' },
    { to: '/projects', label: 'Projects', icon: '🚀' },
    { to: '/moderation', label: 'Safety', icon: '🛡️' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/notifications', label: 'Campaigns', icon: '🔔' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">⟡ Innovation Dating</div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-admin">
          <div className="sidebar-avatar">{admin?.name?.[0] || 'A'}</div>
          <div className="sidebar-admin-info">
            <strong>{admin?.name || 'Admin'}</strong>
            <span className="sidebar-admin-role">{admin?.role?.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        <button onClick={logout} className="sidebar-logout">Logout</button>
      </div>
      <style>{`
        .admin-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 250px; background: #111827; color: #fff; display: flex; flex-direction: column; z-index: 100; border-right: 1px solid rgba(255,255,255,0.06); }
        .sidebar-brand { padding: 22px 20px; font-size: 18px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.06); letter-spacing: -0.3px; }
        .sidebar-nav { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; color: #8899B4; transition: all 0.15s; font-weight: 500; font-size: 14px; }
        .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #E8EDF5; }
        .sidebar-link.active { background: rgba(239,68,68,0.12); color: #EF4444; }
        .sidebar-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-footer { padding: 14px; border-top: 1px solid rgba(255,255,255,0.06); }
        .sidebar-admin { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .sidebar-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
        .sidebar-admin-info { min-width: 0; }
        .sidebar-admin-info strong { display: block; font-size: 13px; }
        .sidebar-admin-role { font-size: 11px; color: #5A6A85; }
        .sidebar-logout { width: 100%; padding: 8px; border-radius: 8px; background: transparent; color: #5A6A85; font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .sidebar-logout:hover { color: #EF4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
        @media (max-width: 768px) {
          .admin-sidebar { width: 60px; }
          .sidebar-brand, .sidebar-admin, .sidebar-logout { display: none; }
          .sidebar-link { justify-content: center; padding: 10px; }
          .sidebar-link span:not(.sidebar-icon) { display: none; }
        }
      `}</style>
    </aside>
  );
}
