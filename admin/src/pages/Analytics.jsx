import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics', { params: { period: `${period}d` } });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const totalGrowth = data?.userGrowth?.reduce((sum, d) => sum + d.count, 0) || 0;
  const totalMatches = data?.matchTrend?.reduce((sum, d) => sum + d.count, 0) || 0;
  const totalMessages = data?.messageTrend?.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <div className="analytics-page page-transition">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Analytics</h1>
          <p>Platform performance metrics</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="period-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-value">{totalGrowth}</div>
          <div className="stat-label">New Users</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{totalMatches}</div>
          <div className="stat-label">New Matches</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{totalMessages.toLocaleString()}</div>
          <div className="stat-label">Messages Sent</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">${(data?.subscriptionRevenue || 0).toLocaleString()}</div>
          <div className="stat-label">Revenue</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>User Growth (by day)</h3>
          <div className="chart-placeholder">
            {data?.userGrowth?.length > 0 ? (
              <div className="bar-chart">
                {data.userGrowth.slice(-14).map((d, i) => (
                  <div key={i} className="bar-wrapper">
                    <div className="bar" style={{ height: `${(d.count / Math.max(...data.userGrowth.map(x => x.count))) * 150}px` }} />
                    <span className="bar-label">{d._id?.slice(-5)}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-light)' }}>No data for this period</p>}
          </div>
        </div>

        <div className="card">
          <h3>Gender Distribution</h3>
          <div className="gender-dist">
            {data?.genderDistribution?.map(g => (
              <div key={g._id} className="gender-item">
                <span className="gender-label">{g._id}: {g.count}</span>
                <div className="gender-bar-bg">
                  <div className="gender-bar" style={{
                    width: `${(g.count / Math.max(...data.genderDistribution.map(x => x.count))) * 100}%`,
                    background: g._id === 'male' ? 'var(--primary)' : g._id === 'female' ? 'var(--secondary)' : 'var(--accent)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .period-select { padding: 8px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--card); font-size: 14px; }
        .chart-placeholder { margin-top: 12px; min-height: 200px; }
        .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 180px; }
        .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .bar { width: 100%; background: linear-gradient(to top, var(--primary), var(--secondary)); border-radius: 4px 4px 0 0; transition: height 0.3s; min-height: 4px; }
        .bar-label { font-size: 10px; color: var(--text-light); margin-top: 4px; }
        .gender-dist { margin-top: 12px; }
        .gender-item { margin-bottom: 12px; }
        .gender-label { display: block; font-size: 14px; margin-bottom: 4px; text-transform: capitalize; }
        .gender-bar-bg { height: 24px; background: var(--bg); border-radius: var(--radius-sm); overflow: hidden; }
        .gender-bar { height: 100%; border-radius: var(--radius-sm); transition: width 0.5s; }
      `}</style>
    </div>
  );
}
