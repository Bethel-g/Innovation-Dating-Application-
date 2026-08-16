import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const CONNECTION_TYPES = [
  { id: 'network', label: 'Network', icon: '🤝', desc: 'Expand professional connections', color: 'var(--primary)' },
  { id: 'collaborate', label: 'Collaborate', icon: '🛠️', desc: 'Work on projects together', color: '#8b5cf6' },
  { id: 'cofounder', label: 'Co-founder', icon: '🚀', desc: 'Find a business partner', color: '#f59e0b' },
  { id: 'mentor', label: 'Mentor', icon: '🎓', desc: 'Learn from experienced pros', color: '#10b981' },
  { id: 'hire', label: 'Hire', icon: '💼', desc: 'Find talent or opportunities', color: '#ef4444' },
];

function MatchReason({ reasons }) {
  if (!reasons || reasons.length === 0) return null;
  return (
    <div className="match-reasons">
      {reasons.map((r, i) => (
        <div key={i} className="reason-item">
          <span className="reason-icon">{r.icon || '✨'}</span>
          <span className="reason-text">{r.text}</span>
        </div>
      ))}
    </div>
  );
}

function ConnectionTypeSelector({ onSelect, currentType }) {
  return (
    <div className="connection-type-grid">
      {CONNECTION_TYPES.map(ct => (
        <button
          key={ct.id}
          className={`connection-type-card ${currentType === ct.id ? 'selected' : ''}`}
          onClick={() => onSelect(ct.id)}
          style={{ '--ct-color': ct.color }}
        >
          <span className="ct-icon">{ct.icon}</span>
          <span className="ct-label">{ct.label}</span>
          <span className="ct-desc">{ct.desc}</span>
        </button>
      ))}
    </div>
  );
}

function ProfileCard({ profile, onAction, connectionType }) {
  const [showDetail, setShowDetail] = useState(false);
  const reasons = profile.matchReasons || [
    { icon: '🎯', text: `${profile.compatibilityScore || 75}% skill overlap` },
    { icon: '🏢', text: profile.user.industry ? `Same industry: ${profile.user.industry}` : 'Complementary expertise' },
    { icon: '📈', text: profile.user.experienceLevel || 'Similar experience level' },
  ];

  return (
    <>
      <div className="profile-card-enhanced card">
        <div className="profile-photo-area">
          {profile.user.photos?.[0]?.url ? (
            <img src={profile.user.photos[0].url} alt="" className="profile-photo" />
          ) : (
            <div className="avatar-placeholder-lg">{profile.user.name?.[0]}</div>
          )}
          <div className="profile-overlay">
            <div className="compatibility-ring" style={{ '--score': `${profile.compatibilityScore || 75}` }}>
              <span className="score-value">{profile.compatibilityScore || 75}%</span>
              <span className="score-label">Match</span>
            </div>
          </div>
          <div className="connection-badge" style={{ background: CONNECTION_TYPES.find(c => c.id === connectionType)?.color || 'var(--primary)' }}>
            {CONNECTION_TYPES.find(c => c.id === connectionType)?.icon} {CONNECTION_TYPES.find(c => c.id === connectionType)?.label}
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-header-row">
            <div>
              <h2 className="profile-name">{profile.user.name}</h2>
              {profile.user.headline && <p className="profile-headline">{profile.user.headline}</p>}
            </div>
            {profile.user.verified && <span className="verified-badge">✓ Verified</span>}
          </div>

          <MatchReason reasons={reasons} />

          <div className="profile-stats-row">
            {profile.user.experienceLevel && (
              <div className="stat-chip">
                <span className="stat-icon">📊</span>
                <span>{profile.user.experienceLevel}</span>
              </div>
            )}
            {profile.user.location && (
              <div className="stat-chip">
                <span className="stat-icon">📍</span>
                <span>{profile.user.location}</span>
              </div>
            )}
            {profile.user.responseRate && (
              <div className="stat-chip">
                <span className="stat-icon">⚡</span>
                <span>{profile.user.responseRate}% response</span>
              </div>
            )}
          </div>

          <div className="profile-skills-area">
            <h4>Skills & Expertise</h4>
            <div className="skill-tags">
              {profile.user.skills?.slice(0, 6).map(s => (
                <span key={s} className="tag-skill">{s}</span>
              ))}
              {profile.user.skills?.length > 6 && (
                <span className="tag-more">+{profile.user.skills.length - 6} more</span>
              )}
            </div>
          </div>

          <p className="profile-bio-snippet">{profile.user.bio?.substring(0, 150)}{profile.user.bio?.length > 150 ? '...' : ''}</p>

          <div className="profile-actions-row">
            <button className="btn btn-outline btn-action" onClick={() => onAction('pass')}>
              <span className="action-icon">✕</span> Skip
            </button>
            <button className="btn btn-secondary btn-action" onClick={() => onAction('super_like')}>
              <span className="action-icon">⭐</span> Super Like
            </button>
            <button className="btn btn-primary btn-action btn-connect" onClick={() => onAction('like')}>
              <span className="action-icon">💬</span> Connect
            </button>
          </div>
        </div>
      </div>

      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2>{profile.user.name}</h2>
            <p>{profile.user.bio}</p>
            <div className="skill-tags" style={{ marginTop: 16 }}>
              {profile.user.skills?.map(s => <span key={s} className="tag-skill">{s}</span>)}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Matches() {
  const [potential, setPotential] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [swipeCount, setSwipeCount] = useState({ used: 0, max: 50 });
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connectionType, setConnectionType] = useState('network');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [potentialRes, matchesRes, swipeRes] = await Promise.all([
        matchAPI.getPotential(),
        matchAPI.getMatches(),
        matchAPI.getSwipeCount(),
      ]);
      setPotential(potentialRes.data);
      setMyMatches(matchesRes.data);
      setSwipeCount(swipeRes.data);
    } catch (err) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (targetUserId, action) => {
    if (swiping) return;
    setSwiping(true);
    try {
      const res = await matchAPI.swipe({ targetUserId, action, connectionType });
      if (res.data.isMatch) {
        toast.success('New connection established!');
      }
      setPotential(prev => prev.filter((_, i) => i !== currentIndex));
      setCurrentIndex(prev => Math.min(prev, potential.length - 2));
      const swipeRes = await matchAPI.getSwipeCount();
      setSwipeCount(swipeRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Swipe failed');
    } finally {
      setSwiping(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="matches-page page-transition">
      <div className="page-header">
        <h1>Smart Discovery</h1>
        <p>AI-curated professional connections tailored to your goals</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
          <span className="tab-icon">🔍</span> Discover
        </button>
        <button className={`tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
          <span className="tab-icon">💬</span> Connections ({myMatches.length})
        </button>
        <button className={`tab ${activeTab === 'recommended' ? 'active' : ''}`} onClick={() => setActiveTab('recommended')}>
          <span className="tab-icon">✨</span> Recommended
        </button>
      </div>

      {activeTab === 'discover' && (
        <div className="discover-section">
          <div className="discover-toolbar">
            <div className="swipe-info">
              <span className="swipe-count">Swipes today: {swipeCount.used}/{swipeCount.max}</span>
              <div className="swipe-progress-bar">
                <div className="swipe-progress-fill" style={{ width: `${(swipeCount.used / swipeCount.max) * 100}%` }} />
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowTypeSelector(!showTypeSelector)}>
              {CONNECTION_TYPES.find(c => c.id === connectionType)?.icon} {CONNECTION_TYPES.find(c => c.id === connectionType)?.label} ▾
            </button>
          </div>

          {showTypeSelector && (
            <ConnectionTypeSelector
              onSelect={(type) => { setConnectionType(type); setShowTypeSelector(false); }}
              currentType={connectionType}
            />
          )}

          {potential.length > 0 && currentIndex < potential.length ? (
            <div className="swipe-card-area">
              <ProfileCard
                profile={potential[currentIndex]}
                onAction={(action) => handleSwipe(potential[currentIndex].user.id, action)}
                connectionType={connectionType}
              />
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>You've seen everyone!</h3>
              <p>Check back later for new suggestions or adjust your discovery preferences.</p>
              <button className="btn btn-primary" onClick={loadData}>Refresh</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="matches-section">
          {myMatches.length > 0 ? (
            <div className="matches-grid">
              {myMatches.map(match => {
                const otherUser = match.users?.find(u => u.id !== JSON.parse(localStorage.getItem('user') || '{}').id);
                return (
                  <Link to={`/chat/${match.id}`} key={match.id} className="match-card card">
                    <div className="match-card-left">
                      <div className="match-avatar-wrap">
                        {otherUser?.photos?.[0]?.url ? (
                          <img src={otherUser.photos[0].url} alt="" />
                        ) : (
                          <div className="avatar-placeholder">{otherUser?.name?.[0]}</div>
                        )}
                        <div className="online-dot" />
                      </div>
                    </div>
                    <div className="match-card-center">
                      <h3>{otherUser?.name}</h3>
                      {otherUser?.headline && <p className="match-headline">{otherUser.headline}</p>}
                      <div className="match-skills">
                        {otherUser?.skills?.slice(0, 3).map(s => <span key={s} className="tag-skill tag-xs">{s}</span>)}
                      </div>
                    </div>
                    <div className="match-card-right">
                      <span className="match-arrow">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No connections yet</h3>
              <p>Start discovering professionals to build your network!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommended' && (
        <div className="recommended-section">
          <div className="rec-header">
            <h3>AI-Curated Recommendations</h3>
            <p>Based on your skills, industry, and professional goals</p>
          </div>
          <div className="rec-grid">
            {potential.slice(0, 6).map((profile, idx) => (
              <div key={idx} className="rec-card card">
                <div className="rec-card-top">
                  {profile.user.photos?.[0]?.url ? (
                    <img src={profile.user.photos[0].url} alt="" className="rec-avatar" />
                  ) : (
                    <div className="avatar-placeholder-sm">{profile.user.name?.[0]}</div>
                  )}
                  <div className="rec-match-score">
                    <span className="rec-score-num">{profile.compatibilityScore || 75}%</span>
                    <span className="rec-score-label">Match</span>
                  </div>
                </div>
                <h4>{profile.user.name}</h4>
                <p className="rec-headline">{profile.user.headline}</p>
                <div className="skill-tags">
                  {profile.user.skills?.slice(0, 3).map(s => <span key={s} className="tag-skill tag-xs">{s}</span>)}
                </div>
                <MatchReason reasons={profile.matchReasons?.slice(0, 2)} />
                <div className="rec-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => { setActiveTab('discover'); setCurrentIndex(idx); }}>View</button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleSwipe(profile.user.id, 'like')}>Connect</button>
                </div>
              </div>
            ))}
          </div>
          {potential.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>No recommendations yet</h3>
              <p>Complete your profile to get AI-powered recommendations.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .matches-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }
        .tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); transition: all 0.2s; border: none; cursor: pointer; font-size: 14px; }
        .tab:hover { background: rgba(74,108,247,0.05); }
        .tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .tab-icon { margin-right: 6px; }

        .discover-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; }
        .swipe-info { flex: 1; }
        .swipe-count { font-size: 13px; color: var(--text-light); display: block; margin-bottom: 6px; }
        .swipe-progress-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .swipe-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 2px; transition: width 0.3s; }

        .connection-type-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 20px; }
        .connection-type-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; background: var(--card); border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
        .connection-type-card:hover { border-color: var(--ct-color); transform: translateY(-2px); }
        .connection-type-card.selected { border-color: var(--ct-color); background: color-mix(in srgb, var(--ct-color) 8%, transparent); }
        .ct-icon { font-size: 20px; }
        .ct-label { font-size: 12px; font-weight: 600; }
        .ct-desc { font-size: 10px; color: var(--text-light); text-align: center; }

        .swipe-card-area { display: flex; justify-content: center; }
        .profile-card-enhanced { width: 100%; max-width: 480px; overflow: hidden; }
        .profile-photo-area { position: relative; width: 100%; height: 320px; overflow: hidden; }
        .profile-photo { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder-lg { width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 64px; font-weight: 600; }
        .profile-overlay { position: absolute; top: 16px; right: 16px; }
        .compatibility-ring { width: 64px; height: 64px; border-radius: 50%; background: conic-gradient(var(--primary) calc(var(--score) * 1%), var(--border) 0); display: flex; align-items: center; justify-content: center; position: relative; }
        .compatibility-ring::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--card); }
        .compatibility-ring span { position: relative; z-index: 1; }
        .score-value { font-size: 14px; font-weight: 700; color: var(--primary); display: block; text-align: center; }
        .score-label { font-size: 8px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; }
        .connection-badge { position: absolute; bottom: 12px; left: 12px; padding: 6px 12px; border-radius: 16px; color: #fff; font-size: 12px; font-weight: 600; }

        .profile-details { padding: 20px; }
        .profile-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .profile-name { font-size: 22px; margin-bottom: 2px; }
        .profile-headline { color: var(--primary); font-size: 14px; font-weight: 500; }
        .verified-badge { color: var(--primary); font-size: 13px; font-weight: 600; background: rgba(74,108,247,0.08); padding: 4px 10px; border-radius: 12px; white-space: nowrap; }

        .match-reasons { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; padding: 12px; background: rgba(74,108,247,0.04); border-radius: var(--radius-sm); border-left: 3px solid var(--primary); }
        .reason-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text); }
        .reason-icon { font-size: 14px; flex-shrink: 0; }

        .profile-stats-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .stat-chip { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg-secondary); border-radius: 12px; font-size: 12px; color: var(--text-light); }

        .profile-skills-area { margin: 12px 0; }
        .profile-skills-area h4 { font-size: 13px; color: var(--text-light); margin-bottom: 6px; }
        .tag-more { font-size: 12px; color: var(--text-light); padding: 2px 8px; background: var(--bg-secondary); border-radius: 8px; }

        .profile-bio-snippet { font-size: 14px; color: var(--text-light); line-height: 1.5; margin: 12px 0; }

        .profile-actions-row { display: flex; gap: 10px; margin-top: 16px; }
        .btn-action { flex: 1; padding: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .action-icon { font-size: 16px; }
        .btn-connect { flex: 1.5; }

        .matches-grid { display: flex; flex-direction: column; gap: 8px; }
        .match-card { display: flex; align-items: center; gap: 16px; padding: 16px; transition: all 0.2s; text-decoration: none; color: inherit; }
        .match-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .match-avatar-wrap { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; position: relative; flex-shrink: 0; }
        .match-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .online-dot { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #22c55e; border: 2px solid var(--card); border-radius: 50%; }
        .match-card-center { flex: 1; min-width: 0; }
        .match-card-center h3 { font-size: 16px; margin-bottom: 2px; }
        .match-headline { font-size: 13px; color: var(--text-light); }
        .match-skills { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
        .match-arrow { font-size: 20px; color: var(--text-light); }

        .rec-header { margin-bottom: 20px; }
        .rec-header h3 { font-size: 20px; }
        .rec-header p { color: var(--text-light); font-size: 14px; }
        .rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .rec-card { padding: 20px; text-align: center; }
        .rec-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .rec-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder-sm { width: 56px; height: 56px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600; border-radius: 50%; }
        .rec-match-score { text-align: center; }
        .rec-score-num { font-size: 20px; font-weight: 700; color: var(--primary); display: block; }
        .rec-score-label { font-size: 10px; color: var(--text-light); text-transform: uppercase; }
        .rec-card h4 { font-size: 16px; margin-bottom: 4px; }
        .rec-headline { font-size: 13px; color: var(--text-light); margin-bottom: 8px; }
        .rec-actions { display: flex; gap: 8px; margin-top: 12px; }

        .tag-xs { font-size: 11px; padding: 2px 6px; }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-light); margin-bottom: 20px; }

        @media (max-width: 768px) {
          .connection-type-grid { grid-template-columns: repeat(3, 1fr); }
          .rec-grid { grid-template-columns: 1fr; }
          .profile-actions-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
