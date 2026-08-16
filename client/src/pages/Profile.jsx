import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, skillsAPI, projectAPI } from '../services/api';
import toast from 'react-hot-toast';
import AIProfileAnalysis from '../components/ai/AIProfileAnalysis';

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];

const INTENT_OPTIONS = ['Hire', 'Be Hired', 'Collaborate', 'Mentor', 'Find Co-founder', 'Freelance', 'Learn', 'Network'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

const PROFILE_SECTIONS = ['About', 'Skills', 'Experience', 'Projects', 'Endorsements'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const isOwn = !id || id === currentUser?.id;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [endorsements, setEndorsements] = useState({});
  const [activeTab, setActiveTab] = useState('about');
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

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
            currentRole: currentUser.currentRole || '',
            company: currentUser.company || '',
          });
        } else {
          const res = await userAPI.getProfile(id);
          setProfile(res.data);
          const endRes = await skillsAPI.getEndorsements(id);
          setEndorsements(endRes.data);
          try {
            const projRes = await projectAPI.getAll({ userId: id });
            setProjects(projRes.data?.projects || projRes.data || []);
          } catch (e) { /* ignore */ }
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
      skills: prev.skills?.includes(skill) ? prev.skills.filter(s => s !== skill) : [...(prev.skills || []), skill],
    }));
  };

  const toggleIntent = (intent) => {
    setForm(prev => ({
      ...prev,
      intents: prev.intents?.includes(intent) ? prev.intents.filter(i => i !== intent) : [...(prev.intents || []), intent],
    }));
  };

  const handleEndorse = async (skill) => {
    try {
      await skillsAPI.endorse(profile.id, skill);
      setEndorsements(prev => ({ ...prev, [skill]: (prev[skill] || 0) + 1 }));
      toast.success(`Endorsed for ${skill}!`);
    } catch (err) {
      toast.error('Failed to endorse');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (photoFile) {
        const fd = new FormData();
        fd.append('photos', photoFile);
        await userAPI.uploadPhotos(fd);
        setPhotoFile(null);
      }
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
      name: 15, headline: 12, bio: 12, skills: 12,
      intents: 10, experienceLevel: 10, location: 9, portfolioLinks: 10, photo: 10,
    };
    if (profile?.name) score += checks.name;
    if (profile?.headline) score += checks.headline;
    if (profile?.bio) score += checks.bio;
    if (profile?.skills?.length > 0) score += checks.skills;
    if (profile?.intents?.length > 0) score += checks.intents;
    if (profile?.experienceLevel) score += checks.experienceLevel;
    if (profile?.location?.city) score += checks.location;
    if (profile?.portfolioLinks?.github || profile?.portfolioLinks?.website) score += checks.portfolioLinks;
    if (profile?.photos?.length > 0) score += checks.photo;
    return Math.min(score, 100);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return <div className="empty-state"><div className="empty-state-icon">👤</div><h3>User not found</h3><p>This profile may have been removed or deactivated.</p></div>;

  const displayProfile = isOwn ? (editing ? form : profile) : profile;
  const completeness = profileCompleteness();

  return (
    <div className="profile-page page-transition">
      {/* Cover Photo */}
      <div className="profile-cover">
        <div className="profile-cover-gradient" />
        {editing && (
          <div className="cover-edit-overlay">
            <label className="btn btn-secondary btn-sm">
              📷 Change Cover
              <input type="file" accept="image/*" className="hidden" onChange={() => {}} />
            </label>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header-card card">
        <div className="profile-header-row">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {profile.photos?.[0]?.url ? (
                <img src={profile.photos[0].url} alt="" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-img profile-avatar-placeholder">{profile.name?.[0]}</div>
              )}
              {profile.isVerified && <span className="verified-badge">✓</span>}
              {editing && (
                <label className="avatar-edit-btn">
                  📷
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files[0])} />
                </label>
              )}
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{profile.name}</h1>
              {profile.headline && <p className="profile-headline">{profile.headline}</p>}
              {profile.currentRole && profile.company && (
                <p className="profile-role">{profile.currentRole} at {profile.company}</p>
              )}
              <div className="profile-meta">
                {profile.location?.city && (
                  <span className="profile-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {profile.location.city}{profile.location.country ? `, ${profile.location.country}` : ''}
                  </span>
                )}
                {profile.experienceLevel && (
                  <span className="profile-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {profile.experienceLevel}
                  </span>
                )}
                {isOwn && (
                  <span className="profile-meta-item status-available">
                    <span className="status-dot online" /> Available
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            {isOwn ? (
              editing ? (
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAIAnalysis(true)}>🤖 AI Analysis</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
                </div>
              )
            ) : (
              <div className="flex gap-2">
                <Link to={`/chat`} className="btn btn-primary btn-sm">Message</Link>
                <button className="btn btn-secondary btn-sm">Connect</button>
                <button className="btn btn-ghost btn-sm btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completeness */}
        {isOwn && (
          <div className="profile-completeness-section">
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <span className="text-sm font-medium text-secondary">Profile Completeness</span>
              <span className="text-sm font-bold" style={{ color: completeness >= 80 ? 'var(--success)' : completeness >= 50 ? 'var(--warning)' : 'var(--primary)' }}>
                {completeness}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${completeness}%` }} />
            </div>
            {completeness < 100 && (
              <p className="text-xs text-tertiary" style={{ marginTop: 6 }}>
                Complete your profile to improve match accuracy
              </p>
            )}
          </div>
        )}

        {/* Intent Badges */}
        {displayProfile.intents?.length > 0 && (
          <div className="profile-intents">
            {displayProfile.intents.map(i => (
              <span key={i} className="badge badge-primary badge-lg">{i}</span>
            ))}
          </div>
        )}
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs tabs-underline">
        {PROFILE_SECTIONS.map(section => (
          <button
            key={section}
            className={`tab ${activeTab === section.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(section.toLowerCase())}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="card">
            {editing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Professional Headline</label>
                  <input className="input" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="e.g., Senior Full-Stack Developer" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Current Role</label>
                    <input className="input" value={form.currentRole || ''} onChange={e => setForm({ ...form, currentRole: e.target.value })} placeholder="e.g., Lead Engineer" />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input className="input" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g., Google" />
                  </div>
                </div>
                <div className="form-group">
                  <label>About</label>
                  <textarea className="textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={5} maxLength={500} placeholder="Tell others about your professional background, goals, and what you're looking for..." />
                  <span className="form-hint">{form.bio?.length || 0}/500</span>
                </div>
                <div className="form-group">
                  <label>Experience Level</label>
                  <select className="select" value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input className="input" value={form.location?.city || ''} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} placeholder="San Francisco" />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input className="input" value={form.location?.country || ''} onChange={e => setForm({ ...form, location: { ...form.location, country: e.target.value } })} placeholder="United States" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Portfolio Links</label>
                  <div className="flex flex-col gap-3">
                    <input className="input" value={form.portfolioLinks?.github || ''} onChange={e => setForm({ ...form, portfolioLinks: { ...form.portfolioLinks, github: e.target.value } })} placeholder="GitHub URL" />
                    <input className="input" value={form.portfolioLinks?.website || ''} onChange={e => setForm({ ...form, portfolioLinks: { ...form.portfolioLinks, website: e.target.value } })} placeholder="Website URL" />
                    <input className="input" value={form.portfolioLinks?.behance || ''} onChange={e => setForm({ ...form, portfolioLinks: { ...form.portfolioLinks, behance: e.target.value } })} placeholder="Behance URL" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-about">
                {displayProfile.bio ? (
                  <p className="profile-bio">{displayProfile.bio}</p>
                ) : (
                  <p className="profile-bio text-tertiary italic">No bio yet. Tell the world about yourself.</p>
                )}

                {(displayProfile.portfolioLinks?.github || displayProfile.portfolioLinks?.website || displayProfile.portfolioLinks?.behance) && (
                  <div className="profile-section">
                    <h4 className="profile-section-title">Portfolio</h4>
                    <div className="flex gap-2 flex-wrap">
                      {displayProfile.portfolioLinks.github && (
                        <a href={displayProfile.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                          GitHub
                        </a>
                      )}
                      {displayProfile.portfolioLinks.website && (
                        <a href={displayProfile.portfolioLinks.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🌐 Website</a>
                      )}
                      {displayProfile.portfolioLinks.behance && (
                        <a href={displayProfile.portfolioLinks.behance} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🎨 Behance</a>
                      )}
                    </div>
                  </div>
                )}

                {!isOwn && displayProfile.compatibilityScore && (
                  <div className="compatibility-meter">
                    <div className="compatibility-score-circle" style={{ background: `conic-gradient(var(--primary) ${displayProfile.compatibilityScore}%, var(--bg) 0%)` }}>
                      {displayProfile.compatibilityScore}%
                    </div>
                    <div>
                      <strong>Compatibility Score</strong>
                      <p className="text-sm text-secondary">Based on shared skills and professional goals</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="card">
            {editing ? (
              <div className="form-group">
                <label>Select your skills</label>
                <div className="skills-grid">
                  {SKILL_OPTIONS.map(s => (
                    <button
                      key={s}
                      className={`skill-chip ${form.skills?.includes(s) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(s)}
                    >
                      {form.skills?.includes(s) && <span>✓</span>}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="profile-section-title">Skills & Expertise</h4>
                {displayProfile.skills?.length > 0 ? (
                  <div className="skills-display">
                    {displayProfile.skills.map(s => (
                      <div key={s} className="skill-card">
                        <div className="skill-card-info">
                          <span className="skill-card-name">{s}</span>
                          <span className="skill-card-endorsements">{endorsements[s] || 0} endorsements</span>
                        </div>
                        {!isOwn && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEndorse(s)}>
                            + Endorse
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary">No skills added yet.</p>
                )}
              </div>
            )}

            {editing && (
              <div className="form-group" style={{ marginTop: 24 }}>
                <label>Professional Intents</label>
                <div className="skills-grid">
                  {INTENT_OPTIONS.map(i => (
                    <button
                      key={i}
                      className={`skill-chip ${form.intents?.includes(i) ? 'selected' : ''}`}
                      onClick={() => toggleIntent(i)}
                    >
                      {form.intents?.includes(i) && <span>✓</span>}
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="card">
            <h4 className="profile-section-title">Experience</h4>
            {displayProfile.experienceLevel ? (
              <div className="experience-item">
                <div className="experience-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                </div>
                <div>
                  <strong>{displayProfile.currentRole || displayProfile.experienceLevel}</strong>
                  {displayProfile.company && <p className="text-secondary">{displayProfile.company}</p>}
                </div>
              </div>
            ) : (
              <p className="text-secondary">No experience information added yet.</p>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="card">
            <h4 className="profile-section-title">Projects</h4>
            {projects.length > 0 ? (
              <div className="projects-list">
                {projects.map(p => (
                  <div key={p.id} className="project-item">
                    <h5>{p.title}</h5>
                    <p className="text-secondary text-sm">{p.description?.substring(0, 120)}</p>
                    <div className="flex gap-2" style={{ marginTop: 8 }}>
                      <span className="badge badge-primary">{p.status}</span>
                      {p.skills?.slice(0, 3).map(s => <span key={s} className="tag-skill">{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Projects will appear here once created or joined.</p>
              </div>
            )}
          </div>
        )}

        {/* Endorsements Tab */}
        {activeTab === 'endorsements' && (
          <div className="card">
            <h4 className="profile-section-title">Endorsements</h4>
            {Object.keys(endorsements).length > 0 ? (
              <div className="endorsements-list">
                {Object.entries(endorsements).sort((a, b) => b[1] - a[1]).map(([skill, count]) => (
                  <div key={skill} className="endorsement-item">
                    <div className="endorsement-skill">
                      <span className="tag-skill">{skill}</span>
                    </div>
                    <div className="endorsement-count">
                      <div className="endorsement-bar" style={{ width: `${Math.min(count * 10, 100)}%` }} />
                      <span>{count} endorsement{count !== 1 ? 's' : ''}</span>
                    </div>
                    {!isOwn && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEndorse(skill)}>+1</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">⭐</div>
                <h3>No endorsements yet</h3>
                <p>Endorse others to build your professional network.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showAIAnalysis && <AIProfileAnalysis user={profile} onClose={() => setShowAIAnalysis(false)} />}

      <style>{`
        .profile-page { max-width: 720px; margin: 0 auto; }

        /* Cover */
        .profile-cover {
          height: 200px;
          background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          position: relative;
          overflow: hidden;
        }
        .profile-cover-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.1) 100%);
        }
        .cover-edit-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.3);
          opacity: 0;
          transition: opacity var(--transition-base);
        }
        .profile-cover:hover .cover-edit-overlay { opacity: 1; }

        /* Header Card */
        .profile-header-card {
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
          margin-top: -1px;
          padding-top: 0;
        }
        .profile-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-6);
          margin-bottom: var(--space-4);
        }
        .profile-avatar-section {
          display: flex;
          align-items: flex-end;
          gap: var(--space-5);
          margin-top: -48px;
        }
        .profile-avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }
        .profile-avatar-img {
          width: 120px;
          height: 120px;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 4px solid var(--card);
          box-shadow: var(--shadow-lg);
        }
        .profile-avatar-placeholder {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-inverse);
          font-size: var(--text-4xl);
          font-weight: var(--weight-bold);
        }
        .verified-badge {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 28px;
          height: 28px;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          border: 3px solid var(--card);
        }
        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          background: var(--card);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          font-size: 14px;
          transition: transform var(--transition-fast);
        }
        .avatar-edit-btn:hover { transform: scale(1.1); }

        .profile-header-info { padding-bottom: 8px; }
        .profile-name { font-size: var(--text-2xl); margin-bottom: 2px; }
        .profile-headline { color: var(--primary); font-weight: var(--weight-medium); font-size: var(--text-md); }
        .profile-role { color: var(--text-secondary); font-size: var(--text-base); margin-top: 2px; }
        .profile-meta { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-2); }
        .profile-meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
        .status-available { color: var(--success); font-weight: var(--weight-medium); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: var(--success); box-shadow: 0 0 0 3px var(--success-light); }

        .profile-header-actions { flex-shrink: 0; padding-top: 8px; }

        /* Completeness */
        .profile-completeness-section { margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-light); }
        .progress-bar {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        /* Intents */
        .profile-intents {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-light);
        }

        /* Tabs */
        .profile-tabs { margin-top: var(--space-6); }
        .profile-content { margin-top: var(--space-5); display: flex; flex-direction: column; gap: var(--space-5); }

        /* About */
        .profile-bio { font-size: var(--text-md); line-height: var(--leading-relaxed); color: var(--text); }
        .profile-section { margin-top: var(--space-6); }
        .profile-section-title { font-size: var(--text-lg); margin-bottom: var(--space-4); }

        /* Skills */
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .skill-chip {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          border: 2px solid var(--border);
          background: var(--card);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .skill-chip:hover { border-color: var(--primary); color: var(--primary); }
        .skill-chip.selected {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border-color: transparent;
        }

        .skills-display { display: flex; flex-direction: column; gap: var(--space-3); }
        .skill-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          transition: background var(--transition-fast);
        }
        .skill-card:hover { background: var(--border-light); }
        .skill-card-name { font-weight: var(--weight-semibold); }
        .skill-card-endorsements { font-size: var(--text-sm); color: var(--text-secondary); }

        /* Experience */
        .experience-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
        }
        .experience-icon {
          width: 48px;
          height: 48px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Projects */
        .projects-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .project-item {
          padding: var(--space-4);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border-left: 3px solid var(--primary);
        }

        /* Endorsements */
        .endorsements-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .endorsement-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-3);
        }
        .endorsement-skill { flex-shrink: 0; }
        .endorsement-count {
          flex: 1;
          position: relative;
          height: 24px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          overflow: hidden;
          display: flex;
          align-items: center;
          padding-left: var(--space-3);
        }
        .endorsement-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--primary-light);
          border-radius: var(--radius-sm);
        }
        .endorsement-count span { position: relative; z-index: 1; font-size: var(--text-sm); font-weight: var(--weight-medium); }

        /* Edit Form */
        .profile-edit-form .input, .profile-edit-form .select, .profile-edit-form .textarea {
          background: var(--bg-secondary);
        }

        .hidden { display: none; }

        @media (max-width: 768px) {
          .profile-cover { height: 140px; border-radius: 0; }
          .profile-header-card { border-radius: 0; }
          .profile-header-row { flex-direction: column; align-items: stretch; }
          .profile-avatar-section { flex-direction: column; align-items: center; text-align: center; margin-top: -40px; }
          .profile-avatar-img { width: 100px; height: 100px; }
          .profile-meta { justify-content: center; }
          .profile-header-actions { justify-content: center; display: flex; }
          .profile-intents { justify-content: center; }
          .profile-name { font-size: var(--text-xl); }
        }
      `}</style>
    </div>
  );
}
