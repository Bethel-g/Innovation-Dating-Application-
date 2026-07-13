import { useState, useEffect } from 'react';
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
    <div>
      <div className="page-header"><h1>Admin Dashboard</h1><p>Platform overview</p></div>
      <div className="grid grid-4">
        {statItems.map(item => (
          <div key={item.label} className="card stat-card">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
