import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const pendingReports = stats?.pendingReports || 0;
  const statItems = [
    { label: 'Total Users', value: stats?.totalUsers || 0, hint: 'Registered accounts' },
    { label: 'Online Now', value: stats?.activeUsers || 0, hint: 'Live users' },
    { label: 'Verified', value: stats?.verifiedUsers || 0, hint: 'Trusted profiles' },
    { label: 'Total Matches', value: stats?.totalMatches || 0, hint: 'Connections made' },
    { label: 'Match Rate', value: `${stats?.matchRate || 0}%`, hint: 'Network quality' },
    { label: 'Premium Users', value: stats?.premiumSubscriptions || 0, hint: 'Paid access' },
    { label: 'Reports Pending', value: pendingReports, hint: 'Safety queue' },
    { label: "Today's Messages", value: stats?.messagesToday || 0, hint: 'Daily activity' },
  ];

  const modules = [
    { title: 'Users', path: '/admin/users', desc: 'Manage accounts, verification, profile status, and access.', icon: '👥' },
    { title: 'Moderation', path: '/admin/moderation', desc: 'Review reports, flagged messages, warnings, and bans.', icon: '🛡️' },
    { title: 'Analytics', path: '/admin/analytics', desc: 'Monitor growth, activity, matching, and revenue signals.', icon: '📈' },
    { title: 'Notifications', path: '/admin/notifications', desc: 'Send announcements, campaigns, and platform updates.', icon: '🔔' },
  ];

  return (
    <div className="web-admin-dashboard page-transition">
      <div className="admin-hero-card">
        <div>
          <span>Admin Command Center</span>
          <h1>Admin Dashboard</h1>
          <p>Full admin access for users, moderation, analytics, and notification campaigns.</p>
        </div>
        <div className="admin-hero-actions">
          <Link to="/admin/moderation" className="btn btn-secondary btn-sm">{pendingReports} reports</Link>
          <Link to="/admin/notifications" className="btn btn-primary btn-sm">Send Campaign</Link>
        </div>
      </div>

      <div className="grid grid-4">
        {statItems.map(item => (
          <div key={item.label} className="card stat-card web-admin-metric">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
            <p>{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="admin-module-grid">
        {modules.map(module => (
          <Link key={module.title} to={module.path} className="card admin-module-card">
            <span>{module.icon}</span>
            <strong>{module.title}</strong>
            <p>{module.desc}</p>
          </Link>
        ))}
      </div>

      <style>{`
        .web-admin-dashboard { display: flex; flex-direction: column; gap: 20px; }
        .admin-hero-card { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 28px; border-radius: 22px; color: #fff; background: linear-gradient(135deg, #111827, #263b80); }
        .admin-hero-card span { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.72); }
        .admin-hero-card h1 { font-size: 34px; line-height: 1; margin: 8px 0; }
        .admin-hero-card p { color: rgba(255,255,255,0.78); }
        .admin-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .web-admin-metric { text-align: left; }
        .web-admin-metric p { color: var(--text-light); font-size: 12px; margin-top: 6px; }
        .admin-module-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .admin-module-card { display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; }
        .admin-module-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,108,247,0.14); }
        .admin-module-card span { font-size: 26px; }
        .admin-module-card p { color: var(--text-light); font-size: 14px; }
        @media (max-width: 900px) { .admin-module-grid { grid-template-columns: repeat(2, 1fr); } .admin-hero-card { flex-direction: column; align-items: flex-start; } }
        @media (max-width: 600px) { .admin-module-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
