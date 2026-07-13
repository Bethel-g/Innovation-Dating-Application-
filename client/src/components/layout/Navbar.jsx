import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = ['admin', 'moderator', 'support'].includes(user?.role);

  const userLinks = [
    { to: '/matches', label: 'Discover', icon: '🔥' },
    { to: '/chat', label: 'Chat', icon: '💬' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/moderation', label: 'Moderation', icon: '🛡️' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/notifications', label: 'Notify', icon: '🔔' },
  ];

  const links = isAdmin && location.pathname.startsWith('/admin') ? adminLinks : userLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : '/matches'} className="navbar-brand">HeartSync</Link>
        <div className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>
        <div className="navbar-right">
          {isAdmin && (
            <Link
              to={location.pathname.startsWith('/admin') ? '/matches' : '/admin'}
              className="btn btn-secondary btn-sm"
            >
              {location.pathname.startsWith('/admin') ? 'User Mode' : 'Admin Mode'}
            </Link>
          )}
          <div className="avatar-sm" style={{ backgroundImage: `url(${user?.photos?.[0]?.url})` }}>
            {!user?.photos?.length && user?.name?.[0]}
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>
      <style>{`
        .navbar { position: fixed; top: 0; left: 0; right: 0; background: var(--card); box-shadow: 0 2px 10px rgba(0,0,0,0.05); z-index: 100; }
        .navbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 70px; display: flex; align-items: center; justify-content: space-between; }
        .navbar-brand { font-size: 24px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .navbar-links { display: flex; gap: 4px; }
        .nav-link { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); transition: all 0.2s; font-weight: 500; color: var(--text-light); }
        .nav-link:hover, .nav-link.active { background: rgba(233,64,87,0.1); color: var(--primary); }
        .nav-icon { font-size: 18px; }
        .navbar-right { display: flex; align-items: center; gap: 12px; }
        .avatar-sm { width: 36px; height: 36px; border-radius: 50%; background-size: cover; background-position: center; background-color: var(--primary); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 14px; }
        @media (max-width: 768px) { .nav-label { display: none; } .nav-link { padding: 8px 12px; } }
      `}</style>
    </nav>
  );
}
