import { useState, useEffect } from 'react';
import { ideasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function IdeaRooms() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', problem: '', solution: '', skillsNeeded: [], collaborationType: 'open' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadIdeas(); }, []);

  const loadIdeas = async () => {
    try {
      const res = await ideasAPI.getAll({ status: 'open' });
      setIdeas(res.data);
    } catch (err) {
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ideasAPI.create(form);
      setIdeas(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', problem: '', solution: '', skillsNeeded: [], collaborationType: 'open' });
      toast.success('Idea posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (ideaId) => {
    try {
      await ideasAPI.join(ideaId, { userId: user.id });
      toast.success('Joined idea!');
      loadIdeas();
    } catch (err) {
      toast.error('Failed to join');
    }
  };

  const toggleSkillNeeded = (skill) => {
    setForm(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.includes(skill)
        ? prev.skillsNeeded.filter(s => s !== skill)
        : [...prev.skillsNeeded, skill],
    }));
  };

  const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="ideas-page page-transition">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Idea Rooms</h1>
          <p>Post ideas, find collaborators, build together</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Post Idea</button>
      </div>

      <div className="grid grid-2">
        {ideas.map(idea => (
          <div key={idea.id} className="card idea-card">
            <div className="idea-card-header">
              <span className={`idea-status ${idea.status?.toLowerCase().replace(' ', '-')}`}>{idea.status || 'Open'}</span>
              <span className="idea-author">{idea.author?.name}</span>
            </div>
            <h3>{idea.title}</h3>
            <div className="idea-detail">
              <strong>Problem:</strong>
              <p>{idea.problem}</p>
            </div>
            <div className="idea-detail">
              <strong>Solution:</strong>
              <p>{idea.solution}</p>
            </div>
            {idea.skillsNeeded?.length > 0 && (
              <div className="idea-skills">
                <strong>Skills Needed:</strong>
                <div className="skill-tags">
                  {idea.skillsNeeded.map(s => <span key={s} className="tag-skill">{s}</span>)}
                </div>
              </div>
            )}
            <div className="idea-meta">
              <span>🤝 {idea.collaborators?.length || 0} collaborators</span>
              <span>💬 {idea.comments?.length || 0} comments</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => handleJoin(idea.id)}>Join Idea</button>
          </div>
        ))}
      </div>

      {ideas.length === 0 && (
        <div className="empty-state">
          <h3>No ideas yet</h3>
          <p>Be the first to post an idea!</p>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Post New Idea</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="What's your idea?" />
              </div>
              <div className="form-group">
                <label>Problem</label>
                <textarea value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} required rows={3} placeholder="What problem does this solve?" />
              </div>
              <div className="form-group">
                <label>Solution</label>
                <textarea value={form.solution} onChange={e => setForm({ ...form, solution: e.target.value })} required rows={3} placeholder="How do you plan to solve it?" />
              </div>
              <div className="form-group">
                <label>Skills Needed</label>
                <div className="interests-grid" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {SKILL_OPTIONS.map(s => (
                    <button key={s} type="button"
                      className={`interest-chip ${form.skillsNeeded.includes(s) ? 'selected' : ''}`}
                      onClick={() => toggleSkillNeeded(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Collaboration Type</label>
                <select value={form.collaborationType} onChange={e => setForm({ ...form, collaborationType: e.target.value })}>
                  <option value="open">Open to All</option>
                  <option value="by-approval">By Approval</option>
                  <option value="invite-only">Invite Only</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Idea'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .ideas-page { max-width: 1000px; margin: 0 auto; }
        .idea-card { display: flex; flex-direction: column; gap: 8px; border-left: 4px solid var(--primary); }
        .idea-card-header { display: flex; justify-content: space-between; align-items: center; }
        .idea-author { font-size: 13px; color: var(--text-light); }
        .idea-card h3 { font-size: 18px; font-weight: 600; }
        .idea-detail strong { font-size: 13px; display: block; margin-bottom: 2px; }
        .idea-detail p { font-size: 14px; color: var(--text-light); line-height: 1.5; }
        .idea-skills { margin: 4px 0; }
        .idea-skills strong { font-size: 13px; display: block; margin-bottom: 4px; }
        .idea-meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-light); }
        .interests-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .interest-chip { padding: 6px 14px; border-radius: 20px; border: 2px solid var(--border); background: var(--card); cursor: pointer; transition: all 0.2s; font-size: 13px; }
        .interest-chip.selected { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-color: transparent; }
      `}</style>
    </div>
  );
}
