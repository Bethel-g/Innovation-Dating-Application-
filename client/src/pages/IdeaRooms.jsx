import { useState, useEffect } from 'react';
import { ideasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all', label: 'All Ideas', icon: '💡' },
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'social', label: 'Social Impact', icon: '🌍' },
  { id: 'health', label: 'Health & Wellness', icon: '🏥' },
  { id: 'finance', label: 'FinTech', icon: '💰' },
  { id: 'education', label: 'EdTech', icon: '📚' },
  { id: 'sustainability', label: 'Sustainability', icon: '🌱' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
];

const STAGES = ['Concept', 'Planning', 'MVP', 'Building', 'Launched'];

function ProgressTracker({ stage }) {
  const currentIdx = STAGES.indexOf(stage) || 0;
  return (
    <div className="progress-tracker">
      {STAGES.map((s, i) => (
        <div key={s} className={`progress-step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`}>
          <div className="step-dot" />
          <span className="step-label">{s}</span>
        </div>
      ))}
    </div>
  );
}

function TrendingBadge({ rank }) {
  if (!rank || rank > 3) return null;
  const labels = { 1: '🔥 Hot', 2: '📈 Rising', 3: '⭐ Popular' };
  return <span className="trending-badge">{labels[rank]}</span>;
}

function IdeaCard({ idea, onJoin, onFollow, isOwner }) {
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await ideasAPI.addComment(idea.id, { text: newComment });
      setNewComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`idea-card card ${expanded ? 'expanded' : ''}`}>
      <div className="idea-card-top">
        <div className="idea-card-meta">
          <span className={`idea-category cat-${idea.category || 'tech'}`}>
            {CATEGORIES.find(c => c.id === (idea.category || 'tech'))?.icon} {CATEGORIES.find(c => c.id === (idea.category || 'tech'))?.label}
          </span>
          <TrendingBadge rank={idea.trendingRank} />
          <span className={`idea-stage stage-${(idea.stage || 'concept').toLowerCase().replace(' ', '-')}`}>
            {idea.stage || 'Concept'}
          </span>
        </div>
        <div className="idea-author-row">
          {idea.author?.photos?.[0]?.url ? (
            <img src={idea.author.photos[0].url} alt="" className="idea-author-img" />
          ) : (
            <div className="avatar-xs">{idea.author?.name?.[0]}</div>
          )}
          <div>
            <span className="idea-author-name">{idea.author?.name}</span>
            <span className="idea-date">{idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : ''}</span>
          </div>
        </div>
      </div>

      <h3 className="idea-title">{idea.title}</h3>

      <div className="idea-problem">
        <strong>The Problem</strong>
        <p>{idea.problem}</p>
      </div>

      <div className="idea-solution">
        <strong>Proposed Solution</strong>
        <p>{idea.solution}</p>
      </div>

      {(idea.stage || idea.progress) && (
        <ProgressTracker stage={idea.stage || 'Concept'} />
      )}

      {idea.skillsNeeded?.length > 0 && (
        <div className="idea-skills-section">
          <strong>Skills Needed</strong>
          <div className="skill-tags">
            {idea.skillsNeeded.map(s => <span key={s} className="tag-skill">{s}</span>)}
          </div>
        </div>
      )}

      <div className="idea-stats-row">
        <div className="idea-stat" title="Collaborators">
          <span className="stat-icon">👥</span>
          <span>{idea.collaborators?.length || 0}</span>
        </div>
        <div className="idea-stat" title="Followers">
          <span className="stat-icon">❤️</span>
          <span>{idea.followers?.length || 0}</span>
        </div>
        <div className="idea-stat" title="Comments">
          <span className="stat-icon">💬</span>
          <span>{idea.comments?.length || 0}</span>
        </div>
        <div className="idea-stat" title="Applications">
          <span className="stat-icon">📋</span>
          <span>{idea.applications?.length || 0}</span>
        </div>
      </div>

      <div className="idea-action-row">
        {!isOwner && (
          <button className="btn btn-primary btn-sm" onClick={() => onJoin(idea.id)}>
            Apply to Join
          </button>
        )}
        <button className="btn btn-outline btn-sm" onClick={() => onFollow(idea.id)}>
          {idea.followers?.some(f => f.id === JSON.parse(localStorage.getItem('user') || '{}').id) ? '❤️ Following' : '🤍 Follow'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Less' : 'More'} ▾
        </button>
      </div>

      {expanded && (
        <div className="idea-expanded">
          {idea.comments?.length > 0 && (
            <div className="idea-comments">
              <h4>Comments</h4>
              {idea.comments.slice(-5).map((c, i) => (
                <div key={i} className="comment-item">
                  <strong>{c.user?.name || 'User'}:</strong> {c.text}
                </div>
              ))}
            </div>
          )}
          <form className="comment-form" onSubmit={handleComment}>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="btn btn-primary btn-xs" disabled={submitting}>
              {submitting ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function IdeaRooms() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', problem: '', solution: '', skillsNeeded: [],
    collaborationType: 'open', category: 'tech', stage: 'Concept',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

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
      setForm({ title: '', problem: '', solution: '', skillsNeeded: [], collaborationType: 'open', category: 'tech', stage: 'Concept' });
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
      toast.success('Application submitted!');
      loadIdeas();
    } catch (err) {
      toast.error('Failed to apply');
    }
  };

  const handleFollow = async (ideaId) => {
    try {
      await ideasAPI.follow?.(ideaId, { userId: user.id }) || await ideasAPI.join(ideaId, { userId: user.id });
      loadIdeas();
    } catch {
      toast.error('Failed to follow');
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

  const filteredIdeas = ideas
    .filter(idea => activeCategory === 'all' || idea.category === activeCategory)
    .filter(idea => !searchQuery || idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) || idea.problem?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.collaborators?.length || 0) - (a.collaborators?.length || 0);
      if (sortBy === 'trending') return (b.trendingRank || 99) - (a.trendingRank || 99);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="ideas-page page-transition">
      <div className="page-header">
        <div>
          <h1>Idea Marketplace</h1>
          <p>Post ideas, find collaborators, build the future together</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Post Idea</button>
      </div>

      <div className="ideas-toolbar">
        <div className="search-bar-ideas">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="ideas-grid">
        {filteredIdeas.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onJoin={handleJoin}
            onFollow={handleFollow}
            isOwner={idea.author?.id === user?.id}
          />
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>{searchQuery ? 'No ideas match your search' : 'No ideas in this category yet'}</h3>
          <p>{searchQuery ? 'Try different keywords' : 'Be the first to post an idea!'}</p>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h2>Post New Idea</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="What's your idea?" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stage</label>
                  <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
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
                <div className="skill-picker">
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
                <div className="collab-options">
                  {[
                    { id: 'open', label: 'Open to All', desc: 'Anyone can join' },
                    { id: 'by-approval', label: 'By Approval', desc: 'Review applications' },
                    { id: 'invite-only', label: 'Invite Only', desc: 'Invite specific people' },
                  ].map(opt => (
                    <label key={opt.id} className={`collab-option ${form.collaborationType === opt.id ? 'selected' : ''}`}>
                      <input type="radio" name="collab" value={opt.id} checked={form.collaborationType === opt.id} onChange={e => setForm({ ...form, collaborationType: e.target.value })} />
                      <span className="collab-label">{opt.label}</span>
                      <span className="collab-desc">{opt.desc}</span>
                    </label>
                  ))}
                </div>
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
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }

        .ideas-toolbar { display: flex; gap: 12px; margin-bottom: 20px; }
        .search-bar-ideas { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
        .search-bar-ideas input { flex: 1; border: none; background: transparent; font-size: 14px; outline: none; }
        .search-icon { color: var(--text-light); }
        .sort-select { padding: 10px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; cursor: pointer; }

        .category-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px; }
        .category-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--card); border: 2px solid var(--border); border-radius: 20px; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-size: 13px; }
        .category-tab:hover { border-color: var(--primary); }
        .category-tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-color: transparent; }
        .cat-icon { font-size: 14px; }

        .ideas-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

        .idea-card { padding: 20px; transition: all 0.3s; border-left: 4px solid var(--primary); }
        .idea-card.expanded { box-shadow: 0 8px 30px rgba(0,0,0,0.12); }

        .idea-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .idea-card-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .idea-category { font-size: 12px; padding: 4px 10px; background: rgba(74,108,247,0.08); border-radius: 12px; font-weight: 500; }
        .idea-stage { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 500; }
        .stage-Concept { background: #f3f4f6; color: #6b7280; }
        .stage-Planning { background: #dbeafe; color: #2563eb; }
        .stage-MVP { background: #fef3c7; color: #d97706; }
        .stage-Building { background: #ede9fe; color: #7c3aed; }
        .stage-Launched { background: #d1fae5; color: #059669; }

        .trending-badge { font-size: 12px; padding: 4px 10px; background: #fef3c7; color: #d97706; border-radius: 12px; font-weight: 600; }

        .idea-author-row { display: flex; align-items: center; gap: 8px; }
        .idea-author-img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
        .avatar-xs { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; }
        .idea-author-name { font-size: 13px; font-weight: 500; display: block; }
        .idea-date { font-size: 11px; color: var(--text-light); }

        .idea-title { font-size: 18px; margin-bottom: 10px; }

        .idea-problem, .idea-solution { margin-bottom: 10px; }
        .idea-problem strong, .idea-solution strong { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-light); display: block; margin-bottom: 4px; }
        .idea-problem p, .idea-solution p { font-size: 14px; color: var(--text); line-height: 1.5; }

        .progress-tracker { display: flex; gap: 0; margin: 16px 0; position: relative; }
        .progress-step { flex: 1; text-align: center; position: relative; }
        .step-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); margin: 0 auto 6px; position: relative; z-index: 1; transition: all 0.3s; }
        .progress-step.done .step-dot { background: var(--primary); }
        .progress-step.current .step-dot { background: var(--primary); box-shadow: 0 0 0 4px rgba(74,108,247,0.2); transform: scale(1.2); }
        .step-label { font-size: 10px; color: var(--text-light); }
        .progress-step.done .step-label, .progress-step.current .step-label { color: var(--primary); font-weight: 600; }
        .progress-step:not(:last-child)::after { content: ''; position: absolute; top: 5px; left: 50%; right: -50%; height: 2px; background: var(--border); z-index: 0; }
        .progress-step.done:not(:last-child)::after { background: var(--primary); }

        .idea-skills-section { margin: 12px 0; }
        .idea-skills-section strong { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-light); display: block; margin-bottom: 6px; }

        .idea-stats-row { display: flex; gap: 16px; margin: 12px 0; padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .idea-stat { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-light); }

        .idea-action-row { display: flex; gap: 8px; margin-top: 12px; }

        .idea-expanded { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
        .idea-comments { margin-bottom: 12px; }
        .idea-comments h4 { font-size: 14px; margin-bottom: 8px; }
        .comment-item { font-size: 13px; color: var(--text-light); padding: 6px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .comment-form { display: flex; gap: 8px; }
        .comment-input { flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; }

        .skill-picker { display: flex; flex-wrap: wrap; gap: 6px; }
        .interest-chip { padding: 6px 14px; border-radius: 20px; border: 2px solid var(--border); background: var(--card); cursor: pointer; transition: all 0.2s; font-size: 13px; }
        .interest-chip.selected { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; border-color: transparent; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .collab-options { display: flex; gap: 10px; }
        .collab-option { flex: 1; padding: 12px; border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer; text-align: center; transition: all 0.2s; }
        .collab-option:hover { border-color: var(--primary); }
        .collab-option.selected { border-color: var(--primary); background: rgba(74,108,247,0.05); }
        .collab-option input { display: none; }
        .collab-label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .collab-desc { display: block; font-size: 12px; color: var(--text-light); }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-light); margin-bottom: 20px; }

        .btn-xs { padding: 4px 10px; font-size: 12px; }
        .btn-ghost { background: transparent; color: var(--text-light); border: none; }
        .btn-ghost:hover { color: var(--primary); background: rgba(74,108,247,0.05); }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; align-items: stretch; }
          .ideas-toolbar { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
          .collab-options { flex-direction: column; }
          .category-tabs { gap: 6px; }
        }
      `}</style>
    </div>
  );
}
