import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AIAssistant from '../ai/AIAssistant';
import { useI18n, LANGUAGES } from '../../context/I18nContext';

const USER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z' },
  { to: '/matches', label: 'Discover', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/jobs', label: 'Jobs', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z' },
  { to: '/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/ideas', label: 'Ideas', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { to: '/mentors', label: 'Mentors', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/companies', label: 'Companies', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { to: '/chat', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: true },
  { to: '/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z' },
  { to: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/admin/moderation', label: 'Moderation', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/admin/notifications', label: 'Campaigns', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { to: '/admin/projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { to: '/admin/communities', label: 'Communities', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

const MOBILE_NAV = [
  { to: '/feed', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { to: '/matches', label: 'Discover', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/feed?compose=1', label: 'Create', icon: 'M12 4v16m8-8H4', isCreate: true },
  { to: '/chat', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

function NavIcon({ path, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = ['admin', 'moderator', 'support'].includes(user?.role);
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const isAdminArea = isAdmin && location.pathname.startsWith('/admin');
  const navItems = isAdminArea ? ADMIN_NAV : USER_NAV;

  const isActive = (to) => {
    const path = to.split('?')[0];
    if (to.includes('compose=1')) return location.pathname === '/feed' && location.search.includes('compose=1');
    if (path === '/feed') return location.pathname === '/feed' && !location.search.includes('compose=1');
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/chat') return location.pathname.startsWith('/chat');
    if (path === '/profile') return location.pathname.startsWith('/profile');
    if (path === '/admin') return location.pathname === '/admin';
    if (path.startsWith('/admin')) return location.pathname.startsWith(path);
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* AI Assistant Floating Button */}
      {!isAdminArea && (
        <button className="ai-fab" onClick={() => setAiOpen(true)} title="AI Assistant">
          <span className="ai-fab-icon">🤖</span>
        </button>
      )}
      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}

      {/* Desktop Sidebar */}
      <aside className="sidebar" data-collapsed={!sidebarOpen}>
        <div className="sidebar-header">
          {sidebarOpen && (
            <Link to={isAdminArea ? '/admin' : '/dashboard'} className="sidebar-brand">
              <span className="sidebar-brand-icon">⟡</span>
              <span className="sidebar-brand-text">Innovation</span>
            </Link>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? 'Collapse' : 'Expand'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /> : <path d="M9 5l7 7-7 7m8-14l-7 7 7 7" />}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive(item.to) ? 'active' : ''}`}
              title={item.label}
            >
              <NavIcon path={item.icon} size={20} />
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge && sidebarOpen && <span className="sidebar-badge">3</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen ? (
            <div className="sidebar-user">
              <div className="avatar avatar-sm">
                {user?.photos?.[0]?.url ? <img src={user.photos[0].url} alt="" /> : user?.name?.[0]}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-role">{user?.headline || (isAdminArea ? user?.role : 'Professional')}</span>
              </div>
              <div className="sidebar-user-actions">
                <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)} title="Language">
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.flag}</option>
                  ))}
                </select>
                <button className="btn-icon" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} title="Toggle theme">
                  {mode === 'dark' ? '☀️' : '🌙'}
                </button>
                <button className="btn-icon" onClick={handleLogout} title="Logout">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="sidebar-user-collapsed">
              <Link to="/profile" className="avatar avatar-sm" title={user?.name}>
                {user?.photos?.[0]?.url ? <img src={user.photos[0].url} alt="" /> : user?.name?.[0]}
              </Link>
              <button className="btn-icon" onClick={handleLogout} title="Logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <nav className="mobile-topbar">
        <Link to={isAdminArea ? '/admin' : '/dashboard'} className="mobile-brand">
          <span className="mobile-brand-icon">⟡</span>
          <span>Innovation</span>
        </Link>
        <div className="mobile-topbar-actions">
          <Link to="/search" className="mobile-topbar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>
          <Link to="/notifications" className="mobile-topbar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-tabbar">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`mobile-tab ${item.isCreate ? 'create' : ''} ${isActive(item.to) ? 'active' : ''}`}
          >
            {item.isCreate ? (
              <div className="mobile-tab-create">
                <NavIcon path={item.icon} size={22} />
              </div>
            ) : (
              <>
                <NavIcon path={item.icon} size={20} />
                <span>{item.label}</span>
              </>
            )}
          </Link>
        ))}
      </nav>

      <style>{`
        /* ===== Desktop Sidebar ===== */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--card);
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          z-index: var(--z-navbar);
          transition: width var(--transition-slow);
          overflow: hidden;
        }
        .sidebar[data-collapsed="true"] { width: 72px; }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-4);
          height: var(--navbar-height);
          border-bottom: 1px solid var(--border-light);
          flex-shrink: 0;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-lg);
          font-weight: var(--weight-extrabold);
          color: var(--text);
        }
        .sidebar-brand-icon {
          font-size: 24px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .sidebar-toggle:hover { background: var(--bg-secondary); color: var(--text); }
        [data-collapsed="true"] .sidebar-toggle { margin: 0 auto; }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-3) var(--space-3);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: var(--weight-medium);
          font-size: var(--text-base);
          transition: all var(--transition-fast);
          white-space: nowrap;
          position: relative;
        }
        .sidebar-link:hover { background: var(--bg-secondary); color: var(--text); }
        .sidebar-link.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: var(--weight-semibold);
        }
        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--primary);
          border-radius: 0 3px 3px 0;
        }
        [data-collapsed="true"] .sidebar-link { justify-content: center; padding: 12px; }
        [data-collapsed="true"] .sidebar-link span:not(.sidebar-badge) { display: none; }

        .sidebar-badge {
          margin-left: auto;
          background: var(--primary);
          color: var(--text-inverse);
          font-size: 11px;
          font-weight: var(--weight-bold);
          padding: 2px 7px;
          border-radius: var(--radius-full);
          min-width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: var(--space-3);
          border-top: 1px solid var(--border-light);
          flex-shrink: 0;
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2);
        }
        .sidebar-user-info {
          flex: 1;
          min-width: 0;
        }
        .sidebar-user-name {
          display: block;
          font-weight: var(--weight-semibold);
          font-size: var(--text-sm);
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sidebar-user-role {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sidebar-user-actions {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
          align-items: center;
        }
        .lang-select {
          padding: 4px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--card);
          font-size: 14px;
          cursor: pointer;
          line-height: 1;
        }
        .sidebar-user-collapsed {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        /* ===== Mobile Top Bar ===== */
        .mobile-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: var(--card);
          border-bottom: 1px solid var(--border-light);
          padding: 0 var(--space-4);
          align-items: center;
          justify-content: space-between;
          z-index: var(--z-navbar);
        }
        .mobile-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: var(--weight-extrabold);
          font-size: var(--text-lg);
        }
        .mobile-brand-icon {
          font-size: 22px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .mobile-topbar-actions { display: flex; gap: var(--space-2); }
        .mobile-topbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .mobile-topbar-btn:hover { background: var(--bg-secondary); color: var(--text); }

        /* ===== Mobile Bottom Tab Bar ===== */
        .mobile-tabbar {
          display: none;
          position: fixed;
          left: var(--space-3);
          right: var(--space-3);
          bottom: var(--space-3);
          z-index: var(--z-navbar);
          background: var(--card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          padding: var(--space-2) var(--space-2);
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
        }
        .mobile-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 8px 4px;
          border-radius: var(--radius-lg);
          color: var(--text-tertiary);
          font-size: 10px;
          font-weight: var(--weight-semibold);
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .mobile-tab:hover { color: var(--text-secondary); }
        .mobile-tab.active { color: var(--primary); }
        .mobile-tab.active svg { color: var(--primary); }

        .mobile-tab-create {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: var(--text-inverse);
          border-radius: var(--radius-full);
          margin-top: -20px;
          box-shadow: 0 4px 12px rgba(239,68,68,0.35);
          transition: transform var(--transition-fast);
        }
        .mobile-tab-create:hover { transform: scale(1.05); }

        /* ===== Responsive ===== */
        @media (max-width: 1024px) {
          .sidebar { width: 72px; }
          .sidebar .sidebar-brand-text { display: none; }
          .sidebar .sidebar-link span:not(.sidebar-badge) { display: none; }
          .sidebar .sidebar-link { justify-content: center; padding: 12px; }
          .sidebar .sidebar-user-info { display: none; }
          .sidebar .sidebar-user-actions { display: none; }
          .sidebar .sidebar-user-collapsed { display: flex; }
          .sidebar[data-collapsed="true"] { width: 72px; }
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-topbar { display: flex; }
          .mobile-tabbar { display: grid; }
        }

        /* ===== AI FAB ===== */
        .ai-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(74,108,247,0.4);
          z-index: 9998;
          transition: all 0.3s;
        }
        .ai-fab:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(74,108,247,0.5); }
        .ai-fab-icon { font-size: 24px; }
        @media (max-width: 768px) {
          .ai-fab { bottom: 80px; right: 16px; width: 48px; height: 48px; }
          .ai-fab-icon { font-size: 20px; }
        }
      `}</style>
    </>
  );
}
