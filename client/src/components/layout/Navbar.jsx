import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = ['admin', 'moderator', 'support'].includes(user?.role);
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const userLinks = [
    { to: '/feed', label: 'Feed', icon: '🏠' },
    { to: '/matches', label: 'Network', icon: '🔍' },
    { to: '/chat', label: 'Messages', icon: '💬' },
    { to: '/notifications', label: 'Alerts', icon: '🔔' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const mobileLinks = [
    { to: '/feed', label: 'Feed', icon: '🏠' },
    { to: '/matches', label: 'Network', icon: '🔍' },
    { to: '/feed?compose=1', label: 'Post', icon: '➕' },
    { to: '/chat', label: 'Messages', icon: '💬' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/moderation', label: 'Moderation', icon: '🛡️' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/notifications', label: 'Notify', icon: '🔔' },
  ];

  const isAdminArea = isAdmin && location.pathname.startsWith('/admin');
  const links = isAdminArea ? adminLinks : userLinks;
  const homePath = isAdminArea ? '/admin' : '/matches';

  const isActive = (to) => {
    const path = to.split('?')[0];
    if (to.includes('compose=1')) return location.pathname === '/feed' && location.search.includes('compose=1');
    if (path === '/feed') return location.pathname === '/feed' && !location.search.includes('compose=1');
    if (path === '/chat') return location.pathname.startsWith('/chat');
    if (path === '/profile') return location.pathname.startsWith('/profile');
    return location.pathname === path;
  };

  return (
    <>
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={homePath} className="navbar-brand">Innovation Dating</Link>
        <div className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
          {!isAdminArea && (
            <Link to="/feed?compose=1" className="nav-post-button">Post</Link>
          )}
        </div>
        <div className="navbar-right">
          {!isAdminArea && (
            <div className="app-controls">
              <button className="control-chip" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
                {mode === 'dark' ? 'Light' : 'Dark'}
              </button>
              <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Language">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="am">AM</option>
                <option value="ar">AR</option>
              </select>
            </div>
          )}
          <div className="avatar-sm" style={{ backgroundImage: `url(${user?.photos?.[0]?.url})` }}>
            {!user?.photos?.length && user?.name?.[0]}
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>
    </nav>
    {!isAdminArea && (
      <nav className="mobile-tabbar">
        {mobileLinks.map(link => (
          <Link key={link.label} to={link.to} className={`mobile-tab ${isActive(link.to) ? 'active' : ''}`}>
            <span>{link.icon}</span>
            <small>{link.label}</small>
          </Link>
        ))}
      </nav>
    )}
    <style>{`
        .navbar { position: fixed; top: 0; left: 0; right: 0; background: var(--card); box-shadow: 0 2px 10px rgba(0,0,0,0.05); z-index: 100; }
        .navbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 20px; height: 70px; display: flex; align-items: center; justify-content: space-between; }
        .navbar-brand { font-size: 24px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .navbar-links { display: flex; gap: 4px; }
        .nav-link { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); transition: all 0.2s; font-weight: 500; color: var(--text-light); }
        .nav-link:hover, .nav-link.active { background: rgba(74,108,247,0.1); color: var(--primary); }
        .nav-icon { font-size: 18px; }
        .navbar-right { display: flex; align-items: center; gap: 12px; }
        .nav-post-button { display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; border-radius: 999px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; font-weight: 700; }
        .app-controls { display: flex; align-items: center; gap: 6px; }
        .control-chip, .app-controls select { border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 700; }
        .avatar-sm { width: 36px; height: 36px; border-radius: 50%; background-size: cover; background-position: center; background-color: var(--primary); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 14px; }
        .mobile-tabbar { display: none; }
        @media (max-width: 900px) { .nav-label { display: none; } .nav-link { padding: 8px 12px; } .app-controls { display: none; } }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .navbar-inner { height: 64px; padding: 0 14px; }
          .navbar-brand { font-size: 20px; }
          .navbar-right .btn, .navbar-right .avatar-sm { display: none; }
          .mobile-tabbar { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 120; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; padding: 8px; background: var(--card); border: 1px solid var(--border); border-radius: 22px; box-shadow: 0 12px 30px rgba(0,0,0,0.16); }
          .mobile-tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 48px; border-radius: 16px; color: var(--text-light); font-size: 18px; }
          .mobile-tab small { font-size: 10px; font-weight: 700; }
          .mobile-tab.active { background: rgba(74,108,247,0.12); color: var(--primary); }
        }
      `}</style>
    </>
  );
}
