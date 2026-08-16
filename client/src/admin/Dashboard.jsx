import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [socialStats, setSocialStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [dashRes, postsRes, commentsRes] = await Promise.allSettled([
        adminAPI.getDashboardStats(),
        adminAPI.getPosts({ params: { limit: 1 } }),
        adminAPI.getComments({ params: { limit: 1 } }),
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data);
      if (postsRes.status === 'fulfilled' && commentsRes.status === 'fulfilled') {
        setSocialStats({ totalPosts: postsRes.value.data.total, totalComments: commentsRes.value.data.total });
      }
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const pendingReports = stats?.pendingReports || 0;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, desc: 'Registered innovators', color: 'primary', icon: '👥' },
    { label: 'Online Now', value: stats?.activeUsers || 0, desc: 'Live activity', color: 'success', icon: '🟢' },
    { label: 'Verified Users', value: stats?.verifiedUsers || 0, desc: 'Trusted profiles', color: 'info', icon: '✅' },
    { label: 'Connections', value: stats?.totalMatches || 0, desc: 'Mutual matches', color: 'primary', icon: '🤝' },
    { label: 'Premium Members', value: stats?.premiumSubscriptions || 0, desc: 'Active subscribers', color: 'warning', icon: '💎' },
    { label: 'Posts', value: socialStats?.totalPosts || 0, desc: 'Social feed activity', color: 'primary', icon: '📝' },
    { label: 'Communities', value: stats?.totalCommunities || 0, desc: 'Interest groups', color: 'primary', icon: '🏛️' },
    { label: 'Projects', value: stats?.totalProjects || 0, desc: 'Active collaborations', color: 'primary', icon: '🚀' },
  ];

  const modules = [
    { title: 'Users & Roles', desc: 'Manage users, roles, permissions, and account verification.', path: '/admin/users', icon: '👥', count: stats?.totalUsers || 0 },
    { title: 'Moderation', desc: 'Review reports, flagged content, and user moderation.', path: '/admin/moderation', icon: '🛡️', count: pendingReports, urgent: pendingReports > 0 },
    { title: 'Posts & Content', desc: 'View and moderate all posts across the social feed.', path: '/admin/posts', icon: '📝', count: socialStats?.totalPosts || 0 },
    { title: 'Comments', desc: 'Monitor and moderate comments from all users.', path: '/admin/comments', icon: '💬', count: socialStats?.totalComments || 0 },
    { title: 'Communities', desc: 'Manage communities, verify, and control visibility.', path: '/admin/communities', icon: '🏛️', count: stats?.totalCommunities || 0 },
    { title: 'Projects', desc: 'Oversee projects, stages, and collaboration status.', path: '/admin/projects', icon: '🚀', count: stats?.totalProjects || 0 },
    { title: 'Analytics', desc: 'Track growth, engagement, and platform metrics.', path: '/admin/analytics', icon: '📈' },
    { title: 'Campaigns', desc: 'Send notifications and engagement campaigns.', path: '/admin/notifications', icon: '🔔' },
  ];

  return (
    <div className="admin-dashboard page-transition">
      {/* Hero */}
      <div className="admin-hero">
        <div className="admin-hero-content">
          <span className="admin-hero-badge">ADMIN PANEL</span>
          <h1>Dashboard</h1>
          <p>Manage users, content, communities, projects, and platform growth from one place.</p>
        </div>
        <div className="admin-hero-actions">
          {pendingReports > 0 && (
            <Link to="/admin/moderation" className="btn btn-danger btn-sm">{pendingReports} Reports</Link>
          )}
          <Link to="/admin/notifications" className="btn btn-primary btn-sm">Campaign</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statCards.map(card => (
          <div key={card.label} className={`admin-stat-card stat-${card.color}`}>
            <div className="admin-stat-header">
              <span className="admin-stat-icon">{card.icon}</span>
              <span className={`badge badge-${card.color}`}>{card.desc}</span>
            </div>
            <div className="admin-stat-value">{card.value}</div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="admin-modules-section">
        <h2>Admin Access</h2>
        <div className="admin-modules-grid">
          {modules.map(mod => (
            <Link key={mod.title} to={mod.path} className={`admin-module-card card-hover ${mod.urgent ? 'urgent' : ''}`}>
              <div className="admin-module-icon">{mod.icon}</div>
              <div className="admin-module-content">
                <h4>{mod.title}</h4>
                <p>{mod.desc}</p>
              </div>
              {mod.count !== undefined && (
                <span className={`admin-module-count ${mod.urgent ? 'urgent' : ''}`}>{mod.count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .admin-dashboard { max-width: 1200px; margin: 0 auto; }

        .admin-hero {
          display: flex; align-items: center; justify-content: space-between;
          padding: var(--space-8); border-radius: var(--radius-xl);
          background: linear-gradient(135deg, #0F172A, #1E293B 50%, #0F172A);
          color: white; margin-bottom: var(--space-6);
          position: relative; overflow: hidden;
        }
        .admin-hero::before {
          content: ''; position: absolute; top: -50%; right: -20%;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%);
        }
        .admin-hero-content { position: relative; z-index: 1; }
        .admin-hero-badge {
          display: inline-block; padding: 4px 12px; border-radius: var(--radius-full);
          font-size: var(--text-xs); font-weight: var(--weight-bold);
          letter-spacing: 0.1em; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
          margin-bottom: var(--space-3);
        }
        .admin-hero h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
        .admin-hero p { color: rgba(255,255,255,0.6); font-size: var(--text-base); max-width: 500px; }
        .admin-hero-actions { display: flex; gap: var(--space-3); position: relative; z-index: 1; }

        .admin-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4); margin-bottom: var(--space-6);
        }
        .admin-stat-card {
          background: var(--card); border-radius: var(--radius-lg);
          padding: var(--space-5); border: 1px solid var(--border-light);
          border-left: 4px solid var(--primary);
          transition: all var(--transition-base);
        }
        .admin-stat-card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-2px); }
        .stat-success { border-left-color: var(--success); }
        .stat-warning { border-left-color: var(--warning); }
        .stat-info { border-left-color: var(--info); }
        .stat-primary { border-left-color: var(--primary); }

        .admin-stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); }
        .admin-stat-icon { font-size: 20px; }
        .admin-stat-value { font-size: var(--text-3xl); font-weight: var(--weight-extrabold); line-height: 1; }
        .admin-stat-label { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1); }

        .admin-modules-section { margin-bottom: var(--space-6); }
        .admin-modules-section h2 { font-size: var(--text-xl); margin-bottom: var(--space-4); }
        .admin-modules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }

        .admin-module-card {
          display: flex; align-items: center; gap: var(--space-4);
          padding: var(--space-5); background: var(--card);
          border: 1px solid var(--border-light); border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }
        .admin-module-card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-2px); border-color: var(--primary-border); }
        .admin-module-card.urgent { border-color: var(--danger-border); }

        .admin-module-icon {
          width: 48px; height: 48px; border-radius: var(--radius-lg);
          background: var(--primary-light); display: flex;
          align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .admin-module-content { flex: 1; min-width: 0; }
        .admin-module-content h4 { font-size: var(--text-base); margin-bottom: 2px; }
        .admin-module-content p { font-size: var(--text-sm); color: var(--text-secondary); }

        .admin-module-count {
          background: var(--bg-secondary); padding: 4px 12px;
          border-radius: var(--radius-full); font-size: var(--text-sm);
          font-weight: var(--weight-bold); color: var(--text-secondary);
          flex-shrink: 0;
        }
        .admin-module-count.urgent { background: var(--danger-light); color: var(--danger); }

        @media (max-width: 1024px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-modules-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .admin-hero { flex-direction: column; text-align: center; align-items: center; }
          .admin-hero-actions { justify-content: center; }
          .admin-stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
