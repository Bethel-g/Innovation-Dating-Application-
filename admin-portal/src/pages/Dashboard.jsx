import { useState, useEffect } from 'react';
import api from '../services/api';
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

  const statItems = [
    { label: 'Total Users', value: stats?.totalUsers || 0 },
    { label: 'Online Now', value: stats?.activeUsers || 0 },
    { label: 'Verified', value: stats?.verifiedUsers || 0 },
    { label: 'Total Matches', value: stats?.totalMatches || 0 },
    { label: 'Match Rate', value: `${stats?.matchRate || 0}%` },
    { label: 'Premium Users', value: stats?.premiumSubscriptions || 0 },
    { label: 'Reports Pending', value: stats?.pendingReports || 0 },
    { label: "Today's Messages", value: stats?.messagesToday || 0 },
  ];

  return (
    <div className="dashboard-page page-transition">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Platform overview at a glance</p>
      </div>

      <div className="grid grid-4">
        {statItems.map(item => (
          <div key={item.label} className="card stat-card">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {[
              { label: 'View Pending Reports', icon: '🛡️', path: '/moderation' },
              { label: 'Manage Users', icon: '👥', path: '/users' },
              { label: 'Send Notification', icon: '🔔', path: '/notifications' },
            ].map(action => (
              <a key={action.label} href={action.path} className="quick-action">
                <span>{action.icon}</span>
                {action.label} →
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <p style={{ color: 'var(--text-light)', marginTop: 12, fontSize: 14 }}>
            {stats?.messagesToday} messages sent today<br />
            {stats?.activeUsers} users currently online<br />
            {stats?.pendingReports} reports awaiting review
          </p>
        </div>
      </div>

      <style>{`
        .quick-action { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--radius-sm); transition: background 0.2s; }
        .quick-action:hover { background: rgba(233,64,87,0.05); }
      `}</style>
    </div>
  );
}
