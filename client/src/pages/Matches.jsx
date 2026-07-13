import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Matches() {
  const [potential, setPotential] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [swipeCount, setSwipeCount] = useState({ used: 0, max: 50 });
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    try {
      const res = await matchAPI.swipe({ targetUserId, action });
      if (res.data.isMatch) {
        toast.success('New connection established! 🎉');
      }
      setPotential(prev => prev.filter((_, i) => i !== currentIndex));
      setCurrentIndex(prev => Math.min(prev, potential.length - 2));
      const swipeRes = await matchAPI.getSwipeCount();
      setSwipeCount(swipeRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Swipe failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="matches-page page-transition">
      <div className="tabs">
        <button className={`tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>Discover</button>
        <button className={`tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>Connections ({myMatches.length})</button>
      </div>

      {activeTab === 'discover' ? (
        <div className="discover-section">
          <div className="swipe-count">Swipes today: {swipeCount.used}/{swipeCount.max}</div>
          {potential.length > 0 && currentIndex < potential.length ? (
            <div className="swipe-card-wrapper">
              <div className="swipe-card card" key={currentIndex}>
                <div className="swipe-card-header">
                  {potential[currentIndex].user.photos?.[0]?.url ? (
                    <img src={potential[currentIndex].user.photos[0].url} alt="" className="swipe-card-img" />
                  ) : (
                    <div className="avatar-placeholder">{potential[currentIndex].user.name?.[0]}</div>
                  )}
                </div>
                <div className="swipe-card-info">
                  <h2>{potential[currentIndex].user.name}</h2>
                  {potential[currentIndex].user.headline && (
                    <p className="swipe-headline">{potential[currentIndex].user.headline}</p>
                  )}
                  {potential[currentIndex].user.experienceLevel && (
                    <p className="swipe-experience">📊 {potential[currentIndex].user.experienceLevel}</p>
                  )}
                  <div className="compatibility-score">
                    <span className="badge badge-success">{potential[currentIndex].compatibilityScore}% Compatible</span>
                  </div>
                  <p className="swipe-bio">{potential[currentIndex].user.bio || 'No bio yet'}</p>
                  <div className="swipe-skills">
                    <strong>Skills:</strong>
                    <div className="skill-tags">
                      {potential[currentIndex].user.skills?.map(s => <span key={s} className="tag-skill">{s}</span>)}
                    </div>
                  </div>
                  {potential[currentIndex].insight && (
                    <div className="match-insight">
                      <p className="insight-text">💡 {potential[currentIndex].insight.insight}</p>
                    </div>
                  )}
                </div>
                <div className="swipe-actions">
                  <button className="btn swipe-btn swipe-nope" onClick={() => handleSwipe(potential[currentIndex].user.id, 'pass')}>Skip</button>
                  <button className="btn swipe-btn swipe-super" onClick={() => handleSwipe(potential[currentIndex].user.id, 'super_like')}>⭐ Super</button>
                  <button className="btn swipe-btn swipe-like" onClick={() => handleSwipe(potential[currentIndex].user.id, 'like')}>Connect</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No more profiles</h3>
              <p>Check back later for new suggestions!</p>
              <button className="btn btn-primary" onClick={loadData}>Refresh</button>
            </div>
          )}
        </div>
      ) : (
        <div className="matches-list">
          {myMatches.length > 0 ? (
            <div className="grid grid-2">
              {myMatches.map(match => {
                const otherUser = match.users.find(u => u.id !== JSON.parse(localStorage.getItem('user') || '{}').id);
                return (
                  <Link to={`/chat/${match.id}`} key={match.id} className="match-card card">
                    <div className="match-card-avatar">
                      {otherUser?.photos?.[0]?.url ? (
                        <img src={otherUser.photos[0].url} alt="" />
                      ) : (
                        <div className="avatar-placeholder">{otherUser?.name?.[0]}</div>
                      )}
                    </div>
                    <div className="match-card-info">
                      <h3>{otherUser?.name}</h3>
                      {otherUser?.headline && <p className="match-card-headline">{otherUser.headline}</p>}
                      <div className="match-card-skills">
                        {otherUser?.skills?.slice(0, 3).map(s => <span key={s} className="tag-skill">{s}</span>)}
                      </div>
                    </div>
                    <div className="match-card-action">
                      <span className="text-arrow">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No connections yet</h3>
              <p>Start discovering professionals to build your network!</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .matches-page { max-width: 800px; margin: 0 auto; }
        .tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; }
        .tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); transition: all 0.2s; }
        .tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .swipe-count { text-align: center; color: var(--text-light); margin-bottom: 12px; font-size: 14px; }
        .swipe-card-wrapper { display: flex; justify-content: center; }
        .swipe-card { width: 100%; max-width: 420px; padding: 0; overflow: hidden; }
        .swipe-card-header { width: 100%; height: 280px; overflow: hidden; }
        .swipe-card-img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 48px; }
        .swipe-card-info { padding: 20px; }
        .swipe-card-info h2 { font-size: 24px; margin-bottom: 4px; }
        .swipe-headline { color: var(--primary); font-weight: 500; font-size: 15px; }
        .swipe-experience { color: var(--text-light); font-size: 14px; margin: 4px 0; }
        .compatibility-score { margin-bottom: 12px; }
        .swipe-bio { color: var(--text-light); font-size: 14px; margin: 8px 0; }
        .swipe-skills { margin: 12px 0; }
        .swipe-skills strong { display: block; font-size: 14px; margin-bottom: 4px; }
        .match-insight { margin-top: 12px; padding: 12px; background: rgba(74,108,247,0.05); border-radius: var(--radius-sm); }
        .insight-text { font-size: 14px; color: var(--text-light); }
        .swipe-actions { display: flex; justify-content: center; gap: 16px; padding: 16px 20px 24px; }
        .swipe-btn { padding: 12px 24px; border-radius: 24px; font-size: 15px; font-weight: 600; transition: all 0.2s; }
        .swipe-nope { background: #f0f0f0; color: var(--danger); }
        .swipe-nope:hover { background: var(--danger); color: #fff; }
        .swipe-super { background: #f0f0f0; color: #3498db; }
        .swipe-super:hover { background: #3498db; color: #fff; }
        .swipe-like { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .swipe-like:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(74,108,247,0.4); }
        .match-card { display: flex; align-items: center; gap: 16px; padding: 16px; transition: all 0.2s; }
        .match-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
        .match-card-avatar { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
        .match-card-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .match-card-info { flex: 1; }
        .match-card-info h3 { font-size: 16px; }
        .match-card-headline { color: var(--text-light); font-size: 13px; }
        .match-card-skills { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
        .match-card-action .text-arrow { font-size: 20px; color: var(--text-light); }
      `}</style>
    </div>
  );
}
