import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, subscriptionAPI } from '../services/api';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];

const INTENT_OPTIONS = ['Hire', 'Be Hired', 'Collaborate', 'Mentor', 'Find Co-founder', 'Freelance', 'Learn', 'Network'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const [tab, setTab] = useState('preferences');
  const [preferences, setPreferences] = useState({
    skills: [],
    intents: [],
    experienceLevel: '',
    rolePreference: [],
    maxDistance: 50,
  });
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [location, setLocation] = useState({ city: '', country: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        subscriptionAPI.getCurrent(),
        subscriptionAPI.getPlans(),
      ]);
      setSubscription(subRes.data);
      setPlans(Object.values(plansRes.data));
      setPreferences({
        skills: user.skills || [],
        intents: user.intents || [],
        experienceLevel: user.experienceLevel || '',
        rolePreference: user.preferences?.rolePreference || [],
        maxDistance: user.preferences?.maxDistance || 50,
      });
      setLocation({
        city: user.location?.city || '',
        country: user.location?.country || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      await userAPI.updateProfile(preferences);
      toast.success('Preferences saved!');
    } catch (err) {
      toast.error('Failed to save preferences');
    }
  };

  const saveLocation = async () => {
    try {
      await userAPI.updateLocation(location);
      toast.success('Location updated!');
    } catch (err) {
      toast.error('Failed to update location');
    }
  };

  const handleUpgrade = async (tier) => {
    try {
      const res = await subscriptionAPI.upgrade(tier);
      setSubscription(res.data);
      toast.success(`Upgraded to ${tier}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
    }
  };

  const handleCancel = async () => {
    try {
      await subscriptionAPI.cancel();
      toast.success('Subscription cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This can be reversed by contacting support.')) {
      try {
        await userAPI.deactivate();
        toast.success('Account deactivated');
        logout();
      } catch (err) {
        toast.error('Failed to deactivate');
      }
    }
  };

  const toggleSkill = (skill) => {
    setPreferences(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill],
    }));
  };

  const toggleIntent = (intent) => {
    setPreferences(prev => ({
      ...prev,
      intents: prev.intents?.includes(intent)
        ? prev.intents.filter(i => i !== intent)
        : [...(prev.intents || []), intent],
    }));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="settings-page page-transition">
      <div className="settings-tabs">
        {[
          { id: 'preferences', label: 'Skills & Intents', icon: '🎯' },
          { id: 'location', label: 'Location', icon: '📍' },
          { id: 'subscription', label: 'Subscription', icon: '💎' },
          { id: 'account', label: 'Account', icon: '🔒' },
        ].map(t => (
          <button key={t.id} className={`settings-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {tab === 'preferences' && (
          <div className="card">
            <h2>Professional Preferences</h2>
            <div className="form-group">
              <label>Skills</label>
              <div className="interests-grid">
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s}
                    className={`interest-chip ${preferences.skills?.includes(s) ? 'selected' : ''}`}
                    onClick={() => toggleSkill(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Professional Intents</label>
              <div className="interests-grid">
                {INTENT_OPTIONS.map(i => (
                  <button
                    key={i}
                    className={`interest-chip ${preferences.intents?.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleIntent(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select value={preferences.experienceLevel} onChange={e => setPreferences({ ...preferences, experienceLevel: e.target.value })}>
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Max Distance (miles)</label>
              <input type="range" value={preferences.maxDistance} onChange={e => setPreferences({ ...preferences, maxDistance: parseInt(e.target.value) })} min={1} max={500} />
              <span>{preferences.maxDistance} miles</span>
            </div>
            <button className="btn btn-primary" onClick={savePreferences}>Save Preferences</button>
          </div>
        )}

        {tab === 'location' && (
          <div className="card">
            <h2>Your Location</h2>
            <p className="settings-desc">Set your location to find professionals near you</p>
            <div className="form-group">
              <label>City</label>
              <input value={location.city} onChange={e => setLocation({ ...location, city: e.target.value })} placeholder="San Francisco" />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input value={location.country} onChange={e => setLocation({ ...location, country: e.target.value })} placeholder="United States" />
            </div>
            <button className="btn btn-primary" onClick={saveLocation}>Update Location</button>
          </div>
        )}

        {tab === 'subscription' && (
          <div className="subscription-section">
            {subscription?.tier !== 'free' && (
              <div className="card current-plan">
                <h2>Current Plan: {subscription.tier?.toUpperCase()}</h2>
                <p>Active until: {subscription.subscription?.endDate ? new Date(subscription.subscription.endDate).toLocaleDateString() : 'N/A'}</p>
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel Auto-Renew</button>
              </div>
            )}

            <div className="plans-grid">
              {plans.filter(p => p.price > 0).map(plan => (
                <div key={plan.name} className={`plan-card card ${subscription?.tier === plan.name.toLowerCase() ? 'active-plan' : ''}`}>
                  <h3>{plan.name}</h3>
                  <div className="plan-price">${plan.price}<span>/month</span></div>
                  <ul className="plan-features">
                    {Object.entries(plan.features).map(([key, val]) => (
                      <li key={key} className={val ? '' : 'disabled'}>
                        {val ? '✅' : '❌'} {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => handleUpgrade(plan.name.toLowerCase())} disabled={subscription?.tier === plan.name.toLowerCase()}>
                    {subscription?.tier === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'account' && (
          <div className="card">
            <h2>Account Settings</h2>
            <div className="account-actions">
              <button className="btn btn-secondary" onClick={handleDeactivate}>Deactivate Account</button>
              <button className="btn btn-secondary" onClick={logout}>Sign Out</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .settings-page { max-width: 800px; margin: 0 auto; display: flex; gap: 24px; }
        .settings-tabs { width: 200px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; }
        .settings-tab { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: var(--radius-sm); background: transparent; color: var(--text-light); font-weight: 500; transition: all 0.2s; text-align: left; }
        .settings-tab.active, .settings-tab:hover { background: rgba(74,108,247,0.1); color: var(--primary); }
        .settings-content { flex: 1; }
        .settings-desc { color: var(--text-light); margin-bottom: 20px; }
        .interests-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .interest-chip { padding: 8px 16px; border-radius: 20px; border: 2px solid var(--border); background: var(--card); cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .interest-chip.selected { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-color: transparent; }
        .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .plan-card { padding: 24px; text-align: center; }
        .plan-card.active-plan { border: 2px solid var(--primary); }
        .plan-card h3 { font-size: 22px; margin-bottom: 8px; }
        .plan-price { font-size: 36px; font-weight: 700; margin-bottom: 20px; }
        .plan-price span { font-size: 16px; color: var(--text-light); font-weight: 400; }
        .plan-features { list-style: none; text-align: left; margin-bottom: 24px; }
        .plan-features li { padding: 8px 0; font-size: 14px; }
        .plan-features li.disabled { opacity: 0.4; }
        .account-actions { display: flex; gap: 12px; margin-top: 16px; }
        .current-plan { margin-bottom: 24px; }
        @media (max-width: 768px) {
          .settings-page { flex-direction: column; }
          .settings-tabs { width: 100%; flex-direction: row; overflow-x: auto; }
          .settings-tab { white-space: nowrap; }
          .plans-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
