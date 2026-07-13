import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [socialStats, setSocialStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [dashRes, postsRes, commentsRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/posts', { params: { limit: 1 } }),
        api.get('/admin/comments', { params: { limit: 1 } }),
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data);
      if (postsRes.status === 'fulfilled' && commentsRes.status === 'fulfilled') {
        setSocialStats({
          totalPosts: postsRes.value.data.total,
          totalComments: commentsRes.value.data.total,
        });
      }
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const pendingReports = stats?.pendingReports || 0;
  const statItems = [
    { label: 'Total Users', value: stats?.totalUsers || 0, hint: 'Registered innovators', tone: 'primary' },
    { label: 'Online Now', value: stats?.activeUsers || 0, hint: 'Live activity', tone: 'success' },
    { label: 'Verified Users', value: stats?.verifiedUsers || 0, hint: 'Trusted profiles', tone: 'primary' },
    { label: 'Connections', value: stats?.totalMatches || 0, hint: 'Mutual matches', tone: 'primary' },
    { label: 'Match Rate', value: `${stats?.matchRate || 0}%`, hint: 'Connections per profile', tone: 'success' },
    { label: 'Premium Members', value: stats?.premiumSubscriptions || 0, hint: 'Active subscribers', tone: 'warning' },
    { label: 'Posts', value: socialStats?.totalPosts || 0, hint: 'Social feed activity', tone: 'accent' },
    { label: 'Comments', value: socialStats?.totalComments || 0, hint: 'Engagement level', tone: 'accent' },
    { label: 'Communities', value: stats?.totalCommunities || 0, hint: 'Interest-based circles', tone: 'primary' },
    { label: 'Projects', value: stats?.totalProjects || 0, hint: 'Active collaborations', tone: 'primary' },
    { label: 'Messages Today', value: stats?.messagesToday || 0, hint: 'Real-time communication', tone: 'primary' },
    { label: 'New Today', value: stats?.newUsersToday || 0, hint: 'Fresh sign-ups', tone: 'primary' },
  ];

  const accessModules = [
    { title: 'Users & Roles', desc: 'Manage users, roles, permissions, and account verification.', path: '/users', icon: '👥', badge: `${stats?.totalUsers || 0} users` },
    { title: 'Posts & Content', desc: 'View and moderate all posts across the social feed.', path: '/posts', icon: '📝', badge: `${socialStats?.totalPosts || 0} posts` },
    { title: 'Comments', desc: 'Monitor and moderate comments from all users.', path: '/comments', icon: '💬', badge: `${socialStats?.totalComments || 0} comments` },
    { title: 'Communities', desc: 'Manage communities, verify, and control visibility.', path: '/communities', icon: '🏛️', badge: `${stats?.totalCommunities || 0} communities` },
    { title: 'Projects', desc: 'Oversee projects, stages, and collaboration status.', path: '/projects', icon: '🚀', badge: `${stats?.totalProjects || 0} projects` },
    { title: 'Safety & Reports', desc: 'Review reports, flagged content, and user moderation.', path: '/moderation', icon: '🛡️', badge: `${pendingReports} pending` },
    { title: 'Analytics', desc: 'Track growth, engagement, and platform metrics.', path: '/analytics', icon: '📈', badge: 'Insights' },
    { title: 'Campaigns', desc: 'Send notifications and engagement campaigns.', path: '/notifications', icon: '🔔', badge: 'Campaigns' },
  ];

  const focusPillars = [
    { title: 'AI Matchmaking', desc: 'Recommend relevant connections based on interests, goals, and personality.' },
    { title: 'Social Feed', desc: 'Posts, comments, likes, and shares — the community conversation.' },
    { title: 'Real-Time Chat', desc: 'Monitor conversations, media sharing, and conversation quality.' },
    { title: 'Trust & Safety', desc: 'Protect users through verification, moderation, and reporting workflows.' },
    { title: 'Projects & Collaboration', desc: 'Support project creation, team building, and innovation.' },
    { title: 'Community Growth', desc: 'Support groups, notifications, and engagement loops.' },
  ];

  const commandItems = [
    { label: 'Verify and manage accounts', path: '/users' },
    { label: 'Moderate posts & comments', path: '/posts' },
    { label: 'Resolve safety reports', path: '/moderation' },
    { label: 'Manage communities', path: '/communities' },
    { label: 'Inspect platform trends', path: '/analytics' },
    { label: 'Send announcements', path: '/notifications' },
  ];

  const healthSignals = [
    { label: 'Safety Load', value: pendingReports > 0 ? `${pendingReports} pending` : 'Clear', className: pendingReports > 0 ? 'danger' : 'success' },
    { label: 'Social Activity', value: `${socialStats?.totalPosts || 0} posts, ${socialStats?.totalComments || 0} comments`, className: 'primary' },
    { label: 'Community Activity', value: `${stats?.messagesToday || 0} messages today`, className: 'primary' },
    { label: 'Network Quality', value: `${stats?.verifiedUsers || 0} verified profiles`, className: 'primary' },
    { label: 'Revenue Access', value: `${stats?.premiumSubscriptions || 0} paid members`, className: 'warning' },
  ];

  return (
    <div className="dashboard-page page-transition">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">Innovation Dating Admin</span>
          <h1>Dashboard</h1>
          <p>Manage users, content, communities, projects, and platform growth from one place.</p>
        </div>
        <div className="hero-actions">
          <Link to="/moderation" className={`btn ${pendingReports > 0 ? 'btn-danger' : 'btn-secondary'}`}>⚠ {pendingReports} reports</Link>
          <Link to="/posts" className="btn btn-secondary">📝 Posts</Link>
          <Link to="/notifications" className="btn btn-primary">📢 Campaign</Link>
        </div>
      </div>

      <div className="metrics-grid">
        {statItems.map(item => (
          <div key={item.label} className={`metric-card ${item.tone}`}>
            <div className="metric-value">{item.value}</div>
            <div className="metric-label">{item.label}</div>
            <p>{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card modules-card">
          <div className="section-heading">
            <h2>Admin Access</h2>
            <p>Everything an administrator can open from this portal.</p>
          </div>
          <div className="module-list">
            {accessModules.map(module => (
              <Link key={module.title} to={module.path} className="module-item">
                <div className="module-item-top">
                  <span className="module-icon">{module.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{module.title}</strong>
                    <small>{module.desc}</small>
                  </div>
                  <span className="module-badge">{module.badge}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="admin-side-stack">
          <div className="card">
            <div className="section-heading compact">
              <h2>Quick Actions</h2>
              <p>Common admin work.</p>
            </div>
            <div className="command-list">
              {commandItems.map(item => (
                <Link key={item.label} to={item.path} className="command-item">
                  {item.label}<span>→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-heading compact">
              <h2>Platform Health</h2>
              <p>Signals to check first.</p>
            </div>
            <div className="health-list">
              {healthSignals.map(signal => (
                <div key={signal.label} className="health-row">
                  <span>{signal.label}</span>
                  <strong className={signal.className}>{signal.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="card operations-card">
        <div className="section-heading">
          <h2>Product Focus Areas</h2>
          <p>Every control inside this dashboard supports the platform’s core experience.</p>
        </div>
        <div className="coverage-grid">
          {focusPillars.map(pillar => (
            <div key={pillar.title}>
              <strong>{pillar.title}</strong>
              <span>{pillar.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .admin-hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 28px; padding: 32px; border-radius: 20px; color: #fff; background: radial-gradient(circle at top left, rgba(239,68,68,0.25), transparent 60%), linear-gradient(135deg, #0f172a, #1a1a2e 50%, #1e293b); box-shadow: 0 18px 50px rgba(0,0,0,0.12); }
        .admin-hero h1 { font-size: 34px; line-height: 1; margin: 6px 0 10px; }
        .admin-hero p { color: rgba(255,255,255,0.7); max-width: 600px; font-size: 15px; }
        .eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .hero-actions .btn { font-size: 13px; padding: 8px 16px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .metric-card { background: var(--card); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; border-left: 4px solid var(--primary); box-shadow: var(--shadow); }
        .metric-card.success { border-left-color: var(--success); }
        .metric-card.warning { border-left-color: var(--warning); }
        .metric-card.danger { border-left-color: var(--danger); }
        .metric-card.accent { border-left-color: var(--accent); }
        .metric-value { font-size: 30px; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 4px; }
        .metric-label { font-size: 13px; font-weight: 600; color: var(--text-light); }
        .metric-card p { color: #aab6c5; font-size: 11px; margin-top: 4px; }
        .dashboard-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; margin-top: 24px; align-items: start; }
        .section-heading { margin-bottom: 16px; }
        .section-heading h2 { font-size: 18px; font-weight: 700; }
        .section-heading p { color: var(--text-light); font-size: 13px; margin-top: 2px; }
        .section-heading.compact { margin-bottom: 12px; }
        .module-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .command-list, .health-list, .admin-side-stack { display: flex; flex-direction: column; gap: 10px; }
        .module-item { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); transition: all 0.2s; }
        .module-item:hover { border-color: var(--primary); box-shadow: 0 4px 16px rgba(239,68,68,0.08); transform: translateY(-2px); }
        .module-item-top { display: flex; align-items: center; gap: 12px; }
        .module-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(239,68,68,0.08); font-size: 18px; flex-shrink: 0; }
        .module-item strong { font-size: 14px; }
        .module-item small { color: var(--text-light); font-size: 12px; line-height: 1.4; display: block; margin-top: 2px; }
        .module-badge { padding: 3px 10px; border-radius: 999px; background: var(--bg); color: var(--text-light); font-size: 11px; font-weight: 700; white-space: nowrap; margin-left: auto; }
        .command-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .command-item:hover { border-color: var(--primary); color: var(--primary); }
        .health-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .health-row:last-child { border-bottom: 0; }
        .health-row span { color: var(--text-light); }
        .health-row strong { text-align: right; font-size: 13px; }
        .health-row .success { color: var(--success); }
        .health-row .warning { color: #b8860b; }
        .health-row .danger { color: var(--danger); }
        .health-row .primary { color: var(--primary); }
        .operations-card { margin-top: 20px; }
        .coverage-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .coverage-grid div { padding: 14px; border-radius: var(--radius); background: var(--bg); }
        .coverage-grid strong, .coverage-grid span { display: block; }
        .coverage-grid strong { font-size: 14px; }
        .coverage-grid span { color: var(--text-light); font-size: 12px; margin-top: 3px; }
        @media (max-width: 1100px) { .dashboard-grid { grid-template-columns: 1fr; } .module-list { grid-template-columns: 1fr; } .coverage-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .admin-hero { flex-direction: column; align-items: flex-start; } .hero-actions { justify-content: flex-start; } .metrics-grid { grid-template-columns: repeat(2, 1fr); } .coverage-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
