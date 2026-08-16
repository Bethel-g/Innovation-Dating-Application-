import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI, projectAPI, ideasAPI } from '../services/api';
import ProfessionalGraph from '../components/graph/ProfessionalGraph';
import toast from 'react-hot-toast';

const BADGES = [
  { id: 'newcomer', label: 'Newcomer', icon: '🌱', desc: 'Joined the community', color: '#22c55e' },
  { id: 'first_connect', label: 'First Connect', icon: '🤝', desc: 'Made your first connection', color: '#3b82f6' },
  { id: 'collaborator', label: 'Collaborator', icon: '🛠️', desc: 'Joined a project', color: '#8b5cf6' },
  { id: 'mentor', label: 'Mentor', icon: '🎓', desc: 'Completed 5 mentoring sessions', color: '#f59e0b' },
  { id: 'influencer', label: 'Influencer', icon: '🌟', desc: '10+ skill endorsements', color: '#ec4899' },
  { id: 'innovator', label: 'Innovator', icon: '💡', desc: 'Posted 3+ ideas', color: '#06b6d4' },
  { id: 'streak', label: 'Streak Master', icon: '🔥', desc: '7-day login streak', color: '#ef4444' },
  { id: 'rising_star', label: 'Rising Star', icon: '⭐', desc: 'Top 10% this month', color: '#f97316' },
];

function ReputationCard({ user }) {
  const points = user?.reputationPoints || 0;
  const level = Math.floor(points / 100) + 1;
  const progress = points % 100;
  const earnedBadges = user?.badges || ['newcomer'];

  return (
    <div className="reputation-card card">
      <div className="rep-header">
        <h3>Reputation</h3>
        <span className="rep-level">Level {level}</span>
      </div>

      <div className="rep-points-section">
        <div className="rep-points-circle">
          <span className="rep-points-num">{points}</span>
          <span className="rep-points-label">Points</span>
        </div>
        <div className="rep-level-progress">
          <div className="rep-progress-bar">
            <div className="rep-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="rep-progress-text">{progress}/100 to Level {level + 1}</span>
        </div>
      </div>

      <div className="rep-badges">
        <h4>Badges</h4>
        <div className="badges-grid">
          {BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`badge-item ${earned ? 'earned' : 'locked'}`} title={badge.desc}>
                <span className="badge-icon" style={{ filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.4 }}>
                  {badge.icon}
                </span>
                <span className="badge-label">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rep-skills">
        <h4>Top Skills</h4>
        <div className="skill-ratings">
          {(user?.skills || []).slice(0, 5).map((skill, i) => (
            <div key={skill} className="skill-rating-item">
              <span className="skill-name">{skill}</span>
              <div className="skill-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= (5 - i) ? 'filled' : ''}`}>★</span>
                ))}
              </div>
              <span className="skill-endorsements">{user?.endorsementCounts?.[skill] || 0} endorsements</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityFeed({ activities }) {
  return (
    <div className="activity-feed card">
      <h3>Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="feed-list">
          {activities.map((item, i) => (
            <div key={i} className="feed-item">
              <div className="feed-icon" style={{ background: item.color || 'var(--primary)' }}>
                {item.icon || '📌'}
              </div>
              <div className="feed-content">
                <p>{item.text}</p>
                <span className="feed-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-feed">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}

function QuickActions() {
  return (
    <div className="quick-actions card">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <Link to="/matches" className="action-item">
          <span className="action-icon">🔍</span>
          <span className="action-label">Discover</span>
        </Link>
        <Link to="/ideas" className="action-item">
          <span className="action-icon">💡</span>
          <span className="action-label">Post Idea</span>
        </Link>
        <Link to="/projects" className="action-item">
          <span className="action-icon">🚀</span>
          <span className="action-label">Projects</span>
        </Link>
        <Link to="/mentors" className="action-item">
          <span className="action-icon">🎓</span>
          <span className="action-label">Find Mentor</span>
        </Link>
        <Link to="/feed" className="action-item">
          <span className="action-icon">📰</span>
          <span className="action-label">Feed</span>
        </Link>
        <Link to="/search" className="action-item">
          <span className="action-icon">🔎</span>
          <span className="action-label">Search</span>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [recs, projects, ideas] = await Promise.all([
        matchAPI.getPotential().catch(() => ({ data: [] })),
        projectAPI.getAll().catch(() => ({ data: { projects: [] } })),
        ideasAPI.getAll({ status: 'open' }).catch(() => ({ data: [] })),
      ]);
      setRecommendations(recs.data?.slice(0, 4) || []);
      setRecentProjects(projects.data?.projects?.slice(0, 3) || projects.data?.slice(0, 3) || []);
      setTrendingIdeas(ideas.data?.slice(0, 3) || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const activities = [
    { icon: '🤝', text: 'New connection request from Alex', time: '2 hours ago', color: '#3b82f6' },
    { icon: '💡', text: 'Your idea "AI-Powered Hiring" got 5 new followers', time: '5 hours ago', color: '#f59e0b' },
    { icon: '⭐', text: 'You earned the "First Connect" badge!', time: '1 day ago', color: '#22c55e' },
    { icon: '📋', text: 'Task "Design System" moved to Review', time: '1 day ago', color: '#8b5cf6' },
    { icon: '💬', text: 'Sarah commented on your post', time: '2 days ago', color: '#ec4899' },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page page-transition">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p>Here's what's happening in your professional network</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="recommendations-section">
            <div className="section-header">
              <h2>Recommended Connections</h2>
              <Link to="/matches" className="see-all-link">View all →</Link>
            </div>
            <div className="rec-cards-grid">
              {recommendations.map((rec, i) => (
                <div key={i} className="rec-card card">
                  <div className="rec-card-top">
                    {rec.user?.photos?.[0]?.url ? (
                      <img src={rec.user.photos[0].url} alt="" className="rec-avatar" />
                    ) : (
                      <div className="avatar-placeholder-sm">{rec.user?.name?.[0]}</div>
                    )}
                    <span className="rec-score">{rec.compatibilityScore || 75}%</span>
                  </div>
                  <h4>{rec.user?.name}</h4>
                  <p className="rec-headline">{rec.user?.headline}</p>
                  <div className="skill-tags">
                    {rec.user?.skills?.slice(0, 2).map(s => <span key={s} className="tag-skill tag-xs">{s}</span>)}
                  </div>
                  <Link to="/matches" className="btn btn-primary btn-sm btn-full">Connect</Link>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="empty-recs">
                  <p>Complete your profile to get recommendations</p>
                </div>
              )}
            </div>
          </div>

          <div className="trending-section">
            <div className="section-header">
              <h2>Trending Ideas</h2>
              <Link to="/ideas" className="see-all-link">View all →</Link>
            </div>
            <div className="trending-grid">
              {trendingIdeas.map((idea, i) => (
                <div key={i} className="trending-card card">
                  <div className="trending-rank">#{i + 1}</div>
                  <h4>{idea.title}</h4>
                  <p>{idea.problem?.substring(0, 80)}...</p>
                  <div className="trending-meta">
                    <span>👥 {idea.collaborators?.length || 0}</span>
                    <span>❤️ {idea.followers?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="projects-section">
            <div className="section-header">
              <h2>Your Projects</h2>
              <Link to="/projects" className="see-all-link">View all →</Link>
            </div>
            <div className="projects-list-mini">
              {recentProjects.map((project, i) => (
                <Link to={`/projects/${project.id}`} key={i} className="project-mini card">
                  <div className="project-mini-header">
                    <h4>{project.title}</h4>
                    <span className={`project-status-mini status-${project.status}`}>
                      {project.status?.replace('_', ' ') || 'Open'}
                    </span>
                  </div>
                  <p>{project.description?.substring(0, 80)}...</p>
                  <div className="skill-tags">
                    {project.skills?.slice(0, 3).map(s => <span key={s} className="tag-skill tag-xs">{s}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <ProfessionalGraph user={user} />
        </div>

        <div className="dashboard-sidebar">
          <ReputationCard user={user} />
          <QuickActions />
          <ActivityFeed activities={activities} />
        </div>
      </div>

      <style>{`
        .dashboard-page { max-width: 1200px; margin: 0 auto; }
        .dashboard-welcome { margin-bottom: 24px; }
        .dashboard-welcome h1 { font-size: 28px; margin-bottom: 4px; }
        .dashboard-welcome p { color: var(--text-light); font-size: 15px; }

        .dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-header h2 { font-size: 20px; }
        .see-all-link { font-size: 14px; color: var(--primary); text-decoration: none; font-weight: 500; }

        .dashboard-main { display: flex; flex-direction: column; gap: 32px; }

        .rec-cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .rec-card { padding: 16px; text-align: center; }
        .rec-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .rec-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder-sm { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 600; }
        .rec-score { font-size: 18px; font-weight: 700; color: var(--primary); }
        .rec-card h4 { font-size: 15px; margin-bottom: 2px; }
        .rec-headline { font-size: 12px; color: var(--text-light); margin-bottom: 8px; }
        .tag-xs { font-size: 10px; padding: 2px 6px; }
        .btn-full { width: 100%; margin-top: 8px; }

        .trending-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .trending-card { padding: 16px; position: relative; }
        .trending-rank { position: absolute; top: 12px; right: 12px; font-size: 14px; font-weight: 700; color: var(--primary); }
        .trending-card h4 { font-size: 15px; margin-bottom: 6px; }
        .trending-card p { font-size: 13px; color: var(--text-light); line-height: 1.4; margin-bottom: 8px; }
        .trending-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-light); }

        .projects-list-mini { display: flex; flex-direction: column; gap: 12px; }
        .project-mini { padding: 16px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .project-mini:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .project-mini-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .project-mini h4 { font-size: 15px; }
        .project-status-mini { font-size: 11px; padding: 2px 8px; border-radius: 8px; text-transform: capitalize; }
        .status-open { background: #d1fae5; color: #059669; }
        .status-in_progress { background: #fef3c7; color: #d97706; }
        .project-mini p { font-size: 13px; color: var(--text-light); margin-bottom: 8px; }

        .dashboard-sidebar { display: flex; flex-direction: column; gap: 20px; }

        .reputation-card { padding: 20px; }
        .rep-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .rep-header h3 { font-size: 16px; }
        .rep-level { font-size: 13px; padding: 4px 10px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-radius: 12px; font-weight: 600; }

        .rep-points-section { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .rep-points-circle { width: 64px; height: 64px; border-radius: 50%; background: rgba(74,108,247,0.08); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .rep-points-num { font-size: 22px; font-weight: 700; color: var(--primary); line-height: 1; }
        .rep-points-label { font-size: 9px; color: var(--text-light); text-transform: uppercase; }
        .rep-level-progress { flex: 1; }
        .rep-progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
        .rep-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 3px; transition: width 0.3s; }
        .rep-progress-text { font-size: 11px; color: var(--text-light); }

        .rep-badges { margin-bottom: 16px; }
        .rep-badges h4 { font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .badges-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .badge-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: var(--radius-sm); transition: all 0.2s; }
        .badge-item.earned { background: rgba(74,108,247,0.05); }
        .badge-item.locked { cursor: default; }
        .badge-icon { font-size: 20px; }
        .badge-label { font-size: 9px; color: var(--text-light); text-align: center; }

        .rep-skills h4 { font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .skill-ratings { display: flex; flex-direction: column; gap: 8px; }
        .skill-rating-item { display: flex; align-items: center; gap: 8px; }
        .skill-name { font-size: 13px; font-weight: 500; min-width: 70px; }
        .skill-stars { display: flex; gap: 2px; }
        .star { font-size: 12px; color: var(--border); }
        .star.filled { color: #f59e0b; }
        .skill-endorsements { font-size: 11px; color: var(--text-light); margin-left: auto; }

        .quick-actions { padding: 20px; }
        .quick-actions h3 { font-size: 16px; margin-bottom: 16px; }
        .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .action-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; border-radius: var(--radius); text-decoration: none; color: inherit; transition: all 0.2s; }
        .action-item:hover { background: rgba(74,108,247,0.05); }
        .action-icon { font-size: 24px; }
        .action-label { font-size: 12px; font-weight: 500; }

        .activity-feed { padding: 20px; }
        .activity-feed h3 { font-size: 16px; margin-bottom: 16px; }
        .feed-list { display: flex; flex-direction: column; gap: 12px; }
        .feed-item { display: flex; gap: 10px; }
        .feed-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; color: #fff; }
        .feed-content p { font-size: 13px; line-height: 1.4; margin-bottom: 2px; }
        .feed-time { font-size: 11px; color: var(--text-light); }
        .empty-feed { text-align: center; padding: 20px; color: var(--text-light); font-size: 14px; }

        .empty-recs { grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-light); }

        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-sidebar { order: -1; }
          .rec-cards-grid { grid-template-columns: 1fr; }
          .trending-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
