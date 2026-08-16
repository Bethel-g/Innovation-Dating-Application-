import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const METRIC_CARDS = [
  { id: 'dau', label: 'Daily Active Users', icon: '👥', color: '#3b82f6' },
  { id: 'mau', label: 'Monthly Active Users', icon: '📈', color: '#8b5cf6' },
  { id: 'retention', label: 'Retention Rate', icon: '🔄', color: '#22c55e' },
  { id: 'connections', label: 'Connections Made', icon: '🤝', color: '#f59e0b' },
  { id: 'messages', label: 'Messages Sent', icon: '💬', color: '#ec4899' },
  { id: 'projects', label: 'Projects Created', icon: '🚀', color: '#06b6d4' },
  { id: 'jobs', label: 'Job Applications', icon: '💼', color: '#ef4444' },
  { id: 'events', label: 'Event Registrations', icon: '📅', color: '#f97316' },
];

const ENGAGEMENT_METRICS = [
  { id: 'profile_views', label: 'Profile Views', trend: '+12%', up: true },
  { id: 'post_engagement', label: 'Post Engagement', trend: '+8%', up: true },
  { id: 'search_appearances', label: 'Search Appearances', trend: '+15%', up: true },
  { id: 'endorsements', label: 'Skill Endorsements', trend: '+22%', up: true },
  { id: 'mentorship_sessions', label: 'Mentorship Sessions', trend: '+5%', up: true },
  { id: 'report_resolved', label: 'Reports Resolved', trend: '98%', up: true },
];

const SAMPLE_DATA = {
  dau: 1247,
  mau: 8934,
  retention: '72%',
  connections: 3421,
  messages: 28456,
  projects: 892,
  jobs: 456,
  events: 1234,
  userGrowth: [
    { date: 'Mon', count: 45 }, { date: 'Tue', count: 52 }, { date: 'Wed', count: 61 },
    { date: 'Thu', count: 48 }, { date: 'Fri', count: 73 }, { date: 'Sat', count: 38 }, { date: 'Sun', count: 42 },
  ],
  topSkills: [
    { skill: 'React', count: 2341 }, { skill: 'Python', count: 1987 }, { skill: 'JavaScript', count: 1856 },
    { skill: 'Node.js', count: 1234 }, { skill: 'TypeScript', count: 1123 }, { skill: 'UI/UX Design', count: 987 },
  ],
  topLocations: [
    { location: 'Addis Ababa', count: 2341 }, { location: 'Nairobi', count: 1876 }, { location: 'Lagos', count: 1654 },
    { location: 'Remote', count: 1432 }, { location: 'Cairo', count: 987 },
  ],
  revenue: { total: '$45,672', mrr: '$12,340', growth: '+18%' },
};

export default function Analytics() {
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [data, setData] = useState(SAMPLE_DATA);

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/admin/analytics', { params: { period: `${period}d` } });
      setData({ ...SAMPLE_DATA, ...res.data });
    } catch (err) {
      // Use sample data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-page page-transition">
      <div className="page-header">
        <div>
          <h1>Advanced Analytics</h1>
          <p>Comprehensive platform performance metrics</p>
        </div>
        <div className="header-actions">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="period-select">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="btn btn-outline btn-sm">📊 Export Report</button>
        </div>
      </div>

      <div className="analytics-tabs">
        {['overview', 'users', 'engagement', 'revenue'].map(tab => (
          <button key={tab} className={`analytics-tab ${activeView === tab ? 'active' : ''}`} onClick={() => setActiveView(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <>
          <div className="metrics-grid">
            {METRIC_CARDS.map(metric => (
              <div key={metric.id} className="metric-card card" style={{ '--metric-color': metric.color }}>
                <div className="metric-icon">{metric.icon}</div>
                <div className="metric-info">
                  <span className="metric-value">{data[metric.id]?.toLocaleString() || '0'}</span>
                  <span className="metric-label">{metric.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <div className="card chart-card">
              <h3>User Growth</h3>
              <div className="bar-chart">
                {data.userGrowth?.map((d, i) => (
                  <div key={i} className="bar-wrapper">
                    <div className="bar" style={{ height: `${(d.count / Math.max(...data.userGrowth.map(x => x.count))) * 150}px` }} />
                    <span className="bar-label">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card chart-card">
              <h3>Top Skills</h3>
              <div className="horizontal-bars">
                {data.topSkills?.map((s, i) => (
                  <div key={i} className="h-bar-item">
                    <span className="h-bar-label">{s.skill}</span>
                    <div className="h-bar-track">
                      <div className="h-bar-fill" style={{ width: `${(s.count / data.topSkills[0].count) * 100}%` }} />
                    </div>
                    <span className="h-bar-count">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === 'users' && (
        <div className="users-analytics">
          <div className="charts-grid">
            <div className="card">
              <h3>Top Locations</h3>
              <div className="location-list">
                {data.topLocations?.map((loc, i) => (
                  <div key={i} className="location-item">
                    <span className="location-rank">#{i + 1}</span>
                    <span className="location-name">{loc.location}</span>
                    <span className="location-count">{loc.count} users</span>
                    <div className="location-bar">
                      <div className="location-bar-fill" style={{ width: `${(loc.count / data.topLocations[0].count) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>User Segments</h3>
              <div className="segments-list">
                <div className="segment-item">
                  <span className="segment-dot" style={{ background: '#3b82f6' }} />
                  <span className="segment-label">Job Seekers</span>
                  <span className="segment-count">34%</span>
                </div>
                <div className="segment-item">
                  <span className="segment-dot" style={{ background: '#8b5cf6' }} />
                  <span className="segment-label">Hiring Managers</span>
                  <span className="segment-count">18%</span>
                </div>
                <div className="segment-item">
                  <span className="segment-dot" style={{ background: '#22c55e' }} />
                  <span className="segment-label">Mentors</span>
                  <span className="segment-count">12%</span>
                </div>
                <div className="segment-item">
                  <span className="segment-dot" style={{ background: '#f59e0b' }} />
                  <span className="segment-label">Founders</span>
                  <span className="segment-count">15%</span>
                </div>
                <div className="segment-item">
                  <span className="segment-dot" style={{ background: '#ec4899' }} />
                  <span className="segment-label">Freelancers</span>
                  <span className="segment-count">21%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'engagement' && (
        <div className="engagement-analytics">
          <div className="engagement-grid">
            {ENGAGEMENT_METRICS.map(metric => (
              <div key={metric.id} className="engagement-card card">
                <div className="engagement-header">
                  <span className="engagement-label">{metric.label}</span>
                  <span className={`trend-badge ${metric.up ? 'up' : 'down'}`}>{metric.trend}</span>
                </div>
                <div className="engagement-value">{data[metric.id] || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'revenue' && (
        <div className="revenue-analytics">
          <div className="revenue-grid">
            <div className="revenue-card card">
              <h3>Total Revenue</h3>
              <div className="revenue-value">{data.revenue?.total}</div>
              <span className="revenue-growth">{data.revenue?.growth} this period</span>
            </div>
            <div className="revenue-card card">
              <h3>Monthly Recurring</h3>
              <div className="revenue-value">{data.revenue?.mrr}</div>
              <span className="revenue-label">MRR</span>
            </div>
            <div className="revenue-card card">
              <h3>Job Postings</h3>
              <div className="revenue-value">$4,950</div>
              <span className="revenue-label">45 jobs × $110 avg</span>
            </div>
            <div className="revenue-card card">
              <h3>Premium Subscriptions</h3>
              <div className="revenue-value">$7,390</div>
              <span className="revenue-label">148 users × $49.95</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .analytics-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }
        .header-actions { display: flex; gap: 8px; }
        .period-select { padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); font-size: 14px; }

        .analytics-tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .analytics-tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .analytics-tab:hover { background: rgba(74,108,247,0.05); }
        .analytics-tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }

        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .metric-card { padding: 20px; display: flex; align-items: center; gap: 16px; border-left: 4px solid var(--metric-color); }
        .metric-icon { font-size: 28px; }
        .metric-info { display: flex; flex-direction: column; }
        .metric-value { font-size: 24px; font-weight: 700; }
        .metric-label { font-size: 13px; color: var(--text-light); }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .chart-card { padding: 20px; }
        .chart-card h3 { font-size: 16px; margin-bottom: 16px; }
        .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 180px; }
        .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .bar { width: 100%; background: linear-gradient(to top, var(--primary), var(--secondary)); border-radius: 4px 4px 0 0; transition: height 0.3s; min-height: 4px; }
        .bar-label { font-size: 10px; color: var(--text-light); margin-top: 4px; }

        .horizontal-bars { display: flex; flex-direction: column; gap: 10px; }
        .h-bar-item { display: flex; align-items: center; gap: 10px; }
        .h-bar-label { min-width: 100px; font-size: 13px; }
        .h-bar-track { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .h-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 4px; transition: width 0.5s; }
        .h-bar-count { min-width: 40px; font-size: 12px; color: var(--text-light); text-align: right; }

        .location-list { display: flex; flex-direction: column; gap: 12px; }
        .location-item { display: flex; align-items: center; gap: 12px; }
        .location-rank { font-weight: 700; color: var(--primary); min-width: 24px; }
        .location-name { min-width: 120px; font-size: 14px; }
        .location-count { min-width: 80px; font-size: 13px; color: var(--text-light); text-align: right; }
        .location-bar { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .location-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 3px; }

        .segments-list { display: flex; flex-direction: column; gap: 12px; }
        .segment-item { display: flex; align-items: center; gap: 10px; }
        .segment-dot { width: 10px; height: 10px; border-radius: 50%; }
        .segment-label { flex: 1; font-size: 14px; }
        .segment-count { font-weight: 600; font-size: 14px; }

        .engagement-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .engagement-card { padding: 20px; }
        .engagement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .engagement-label { font-size: 13px; color: var(--text-light); }
        .trend-badge { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 8px; }
        .trend-badge.up { background: rgba(34,197,94,0.1); color: #22c55e; }
        .trend-badge.down { background: rgba(239,68,68,0.1); color: #ef4444; }
        .engagement-value { font-size: 28px; font-weight: 700; }

        .revenue-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .revenue-card { padding: 24px; text-align: center; }
        .revenue-card h3 { font-size: 14px; color: var(--text-light); margin-bottom: 8px; }
        .revenue-value { font-size: 36px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
        .revenue-growth { font-size: 14px; color: #22c55e; font-weight: 600; }
        .revenue-label { font-size: 13px; color: var(--text-light); }

        @media (max-width: 1024px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
          .engagement-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; }
          .metrics-grid { grid-template-columns: 1fr; }
          .engagement-grid { grid-template-columns: 1fr; }
          .revenue-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
