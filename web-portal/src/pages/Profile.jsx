import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const INTEREST_OPTIONS = ['travel', 'music', 'fitness', 'cooking', 'reading', 'gaming', 'photography', 'art', 'dancing', 'hiking', 'movies', 'technology', 'sports', 'yoga', 'volunteering'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const isOwn = !id || id === currentUser?._id;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        if (isOwn) {
          setProfile(currentUser);
          setForm({
            name: currentUser.name,
            bio: currentUser.bio || '',
            interests: currentUser.interests || [],
            dateOfBirth: currentUser.dateOfBirth?.split('T')[0] || '',
          });
        } else {
          const res = await userAPI.getProfile(id);
          setProfile(res.data);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, currentUser, isOwn]);

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest],
    }));
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

      <div className="profile-info card">
        {editing ? (
          <>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} maxLength={500} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Interests</label>
              <div className="interests-grid">
                {INTEREST_OPTIONS.map(i => (
                  <button
                    key={i}
                    className={`interest-chip ${form.interests?.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(i)}
                  >
                    {i}
                  </button>
                ))}
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
            <h1 className="profile-name">{profile.name}{profile.isVerified && ' ✅'}</h1>
            <p className="profile-age">{profile.dateOfBirth ? `${new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} years` : ''}</p>
            <p className="profile-bio">{profile.bio || 'No bio yet'}</p>
            {profile.interests?.length > 0 && (
              <div className="profile-interests">
                {profile.interests.map(i => <span key={i} className="tag">{i}</span>)}
              </div>
            )}
            {profile.location?.city && (
              <p className="profile-location">📍 {profile.location.city}{profile.location.country ? `, ${profile.location.country}` : ''}</p>
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
        .profile-age { color: var(--text-light); }
        .profile-bio { margin: 16px 0; line-height: 1.6; color: var(--text-light); }
        .profile-interests { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
        .profile-location { color: var(--text-light); margin-top: 8px; }
        .interests-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .interest-chip { padding: 8px 16px; border-radius: 20px; border: 2px solid var(--border); background: var(--card); cursor: pointer; transition: all 0.2s; font-size: 14px; text-transform: capitalize; }
        .interest-chip.selected { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-color: transparent; }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; }
      `}</style>
    </div>
  );
}
