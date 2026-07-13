import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, skillsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];

const INTENT_OPTIONS = ['Hire', 'Be Hired', 'Collaborate', 'Mentor', 'Find Co-founder', 'Freelance', 'Learn', 'Network'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const isOwn = !id || id === currentUser?.id;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [endorsements, setEndorsements] = useState({});
  const [form, setForm] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        if (isOwn) {
          setProfile(currentUser);
          setForm({
            name: currentUser.name,
            headline: currentUser.headline || '',
            bio: currentUser.bio || '',
            skills: currentUser.skills || [],
            intents: currentUser.intents || [],
            experienceLevel: currentUser.experienceLevel || '',
            location: currentUser.location || { city: '', country: '' },
            portfolioLinks: currentUser.portfolioLinks || { github: '', website: '', behance: '' },
          });
        } else {
          const res = await userAPI.getProfile(id);
          setProfile(res.data);
          const endRes = await skillsAPI.getEndorsements(id);
          setEndorsements(endRes.data);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, currentUser, isOwn]);

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill],
    }));
  };

  const toggleIntent = (intent) => {
    setForm(prev => ({
      ...prev,
      intents: prev.intents?.includes(intent)
        ? prev.intents.filter(i => i !== intent)
        : [...(prev.intents || []), intent],
    }));
  };

  const handleEndorse = async (skill) => {
    try {
      await skillsAPI.endorse(profile.id, skill);
      setEndorsements(prev => ({
        ...prev,
        [skill]: (prev[skill] || 0) + 1,
      }));
      toast.success(`Endorsed for ${skill}!`);
    } catch (err) {
      toast.error('Failed to endorse');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      setUser(res.data);
      setProfile(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const profileCompleteness = () => {
    let score = 0;
    const checks = {
      name: 15, headline: 15, bio: 15, skills: 15,
      intents: 10, experienceLevel: 10, location: 10, portfolioLinks: 10,
    };
    if (profile?.name) score += checks.name;
    if (profile?.headline) score += checks.headline;
    if (profile?.bio) score += checks.bio;
    if (profile?.skills?.length > 0) score += checks.skills;
    if (profile?.intents?.length > 0) score += checks.intents;
    if (profile?.experienceLevel) score += checks.experienceLevel;
    if (profile?.location?.city) score += checks.location;
    if (profile?.portfolioLinks?.github || profile?.portfolioLinks?.website) score += checks.portfolioLinks;
    return score;
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  const displayProfile = isOwn ? (editing ? form : profile) : profile;

  return (
    <div className="profile-page page-transition">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          {profile.photos?.[0]?.url ? (
            <img src={profile.photos[0].url} alt="" className="profile-avatar" />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">{profile.name?.[0]}</div>
          )}
        </div>
        {isOwn && !editing && (
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {isOwn && !editing && (
        <div className="profile-completeness">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-light)', marginBottom: 4 }}>
            <span>Profile Completeness</span>
            <span>{profileCompleteness()}%</span>
          </div>
          <div className="profile-completeness-bar" style={{ width: `${profileCompleteness()}%` }} />
        </div>
      )}

      <div className="profile-info card">
        {editing ? (
          <>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Professional Headline</label>
              <input value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="e.g., Senior Full-Stack Developer" />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} maxLength={500} placeholder="Your professional summary..." />
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Skills</label>
              <div className="interests-grid">
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s}
                    className={`interest-chip ${form.skills?.includes(s) ? 'selected' : ''}`}
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
                    className={`interest-chip ${form.intents?.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleIntent(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <div className="form-row">
                <input value={form.location?.city || ''} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} placeholder="City" />
                <input value={form.location?.country || ''} onChange={e => setForm({ ...form, location: { ...form.location, country: e.target.value } })} placeholder="Country" />
              </div>
            </div>
            <div className="form-group">
              <label>Portfolio Links</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={form.portfolioLinks?.github || ''} onChange={e => setForm({ ...form, portfolioLinks: { ...form.portfolioLinks, github: e.target.value } })} placeholder="GitHub URL" />
                <input value={form.portfolioLinks?.website || ''} onChange={e => setForm({ ...form, portfolioLinks: { ...form.portfolioLinks, website: e.target.value } })} placeholder="Website URL" />
                <input value={form.portfolioLinks?.behance || ''} onChange={e => setForm({ ...form, portfolioLinks: { ...form.portfolioLinks, behance: e.target.value } })} placeholder="Behance URL" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="profile-name-row">
              <h1 className="profile-name">{profile.name}{profile.isVerified && ' ✅'}</h1>
            </div>
            {profile.headline && <p className="profile-headline">{profile.headline}</p>}
            {profile.experienceLevel && <p className="profile-experience">📊 {profile.experienceLevel}</p>}

            {profile.intents?.length > 0 && (
              <div className="profile-intents">
                {profile.intents.map(i => <span key={i} className="badge badge-primary">{i}</span>)}
              </div>
            )}

            <p className="profile-bio">{profile.bio || 'No bio yet'}</p>

            {profile.skills?.length > 0 && (
              <div className="profile-section">
                <h3>Skills</h3>
                <div className="skill-tags">
                  {profile.skills.map(s => (
                    <span key={s} className="tag-skill">
                      {s}
                      {!isOwn && (
                        <button className="endorse-btn" onClick={() => handleEndorse(s)} title="Endorse">
                          +{endorsements[s] || 0}
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {!isOwn && <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>Click + to endorse a skill</p>}
              </div>
            )}

            {profile.location?.city && (
              <p className="profile-location">📍 {profile.location.city}{profile.location.country ? `, ${profile.location.country}` : ''}</p>
            )}

            {(profile.portfolioLinks?.github || profile.portfolioLinks?.website || profile.portfolioLinks?.behance) && (
              <div className="profile-section">
                <h3>Portfolio</h3>
                <div className="profile-links">
                  {profile.portfolioLinks.github && <a href={profile.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🐙 GitHub</a>}
                  {profile.portfolioLinks.website && <a href={profile.portfolioLinks.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🌐 Website</a>}
                  {profile.portfolioLinks.behance && <a href={profile.portfolioLinks.behance} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🎨 Behance</a>}
                </div>
              </div>
            )}

            {!isOwn && profile.compatibilityScore && (
              <div className="compatibility-meter">
                <div className="compatibility-score-circle" style={{ background: `conic-gradient(var(--primary) ${profile.compatibilityScore}%, var(--bg) 0%)` }}>
                  {profile.compatibilityScore}%
                </div>
                <div>
                  <strong>Compatibility Score</strong>
                  <p style={{ fontSize: 13, color: 'var(--text-light)' }}>Based on shared skills and professional goals</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .profile-page { max-width: 600px; margin: 0 auto; }
        .profile-header { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .profile-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--card); box-shadow: var(--shadow); }
        .profile-avatar-placeholder { background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 36px; font-weight: 700; }
        .profile-name { font-size: 28px; font-weight: 700; }
        .profile-name-row { display: flex; align-items: center; gap: 8px; }
        .profile-headline { font-size: 16px; color: var(--primary); font-weight: 500; margin: 4px 0; }
        .profile-experience { font-size: 14px; color: var(--text-light); margin: 4px 0; }
        .profile-intents { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .profile-bio { margin: 16px 0; line-height: 1.6; color: var(--text-light); }
        .profile-section { margin: 16px 0; }
        .profile-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .profile-location { color: var(--text-light); margin-top: 8px; }
        .profile-links { display: flex; gap: 8px; flex-wrap: wrap; }
        .endorse-btn { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 12px; padding: 0 0 0 4px; font-weight: 600; }
        .endorse-btn:hover { text-decoration: underline; }
        .tag-skill { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; background: rgba(74,108,247,0.1); color: var(--primary); border: 1px solid rgba(74,108,247,0.2); font-size: 13px; font-weight: 500; margin: 3px; }
        .interests-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .interest-chip { padding: 8px 16px; border-radius: 20px; border: 2px solid var(--border); background: var(--card); cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .interest-chip.selected { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-color: transparent; }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; }
      `}</style>
    </div>
  );
}
