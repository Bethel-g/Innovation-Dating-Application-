import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

const INTENT_OPTIONS = ['Hire', 'Be Hired', 'Collaborate', 'Mentor', 'Find Co-founder', 'Freelance', 'Learn', 'Network'];

export default function Search() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    skills: [],
    role: '',
    experienceLevel: '',
    location: '',
    intent: '',
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.query) params.query = filters.query;
      if (filters.skills.length > 0) params.skills = filters.skills.join(',');
      if (filters.role) params.role = filters.role;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.location) params.location = filters.location;
      if (filters.intent) params.intent = filters.intent;

      const res = await userAPI.getNearby(params);
      setResults(res.data);
    } catch (err) {
      toast.error('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const toggleSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div className="search-page page-transition">
      <div className="page-header">
        <h1>Search Professionals</h1>
        <p>Find the right people for your projects and network</p>
      </div>

      <div className="card search-filters-card">
        <div className="search-filters">
          <input
            placeholder="Search by name or role..."
            value={filters.query}
            onChange={e => setFilters({ ...filters, query: e.target.value })}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select value={filters.experienceLevel} onChange={e => setFilters({ ...filters, experienceLevel: e.target.value })}>
            <option value="">All Levels</option>
            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filters.intent} onChange={e => setFilters({ ...filters, intent: e.target.value })}>
            <option value="">All Intents</option>
            {INTENT_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <input
            placeholder="Location"
            value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })}
            style={{ width: 150 }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        <div className="filter-skills">
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-light)' }}>Filter by skills:</span>
          <div className="skill-tags">
            {SKILL_OPTIONS.slice(0, 10).map(s => (
              <button key={s}
                className={`tag-skill filter-skill-chip ${filters.skills.includes(s) ? 'active' : ''}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" /></div>
      ) : results.length > 0 ? (
        <div className="grid grid-2">
          {results.map(prof => (
            <Link to={`/profile/${prof.id}`} key={prof.id} className="card search-result-card">
              <div className="search-result-header">
                <div className="search-result-avatar">
                  {prof.photos?.[0]?.url ? (
                    <img src={prof.photos[0].url} alt="" />
                  ) : (
                    <div className="avatar-placeholder-sm">{prof.name?.[0]}</div>
                  )}
                </div>
                <div>
                  <h3>{prof.name}</h3>
                  {prof.headline && <p className="search-result-headline">{prof.headline}</p>}
                </div>
              </div>
              {prof.experienceLevel && <p className="search-result-level">📊 {prof.experienceLevel}</p>}
              <div className="skill-tags">
                {prof.skills?.slice(0, 5).map(s => <span key={s} className="tag-skill">{s}</span>)}
              </div>
              {prof.intents?.length > 0 && (
                <div className="search-result-intents">
                  {prof.intents.slice(0, 3).map(i => <span key={i} className="badge badge-primary">{i}</span>)}
                </div>
              )}
              {prof.location?.city && <p className="search-result-location">📍 {prof.location.city}</p>}
              <div className="search-result-action">
                <span className="btn btn-primary btn-sm">View Profile</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      )}

      <style>{`
        .search-page { max-width: 1000px; margin: 0 auto; }
        .search-filters-card { margin-bottom: 24px; }
        .filter-skills { margin-top: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .filter-skill-chip { cursor: pointer; padding: 4px 12px; font-size: 13px; background: rgba(74,108,247,0.05); border: 1px solid rgba(74,108,247,0.15); border-radius: 20px; color: var(--text-light); transition: all 0.2s; }
        .filter-skill-chip.active { background: rgba(74,108,247,0.15); color: var(--primary); border-color: var(--primary); }
        .search-result-card { padding: 20px; transition: all 0.2s; }
        .search-result-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); transform: translateY(-2px); }
        .search-result-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .search-result-avatar { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
        .search-result-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder-sm { width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 600; }
        .search-result-headline { color: var(--primary); font-size: 14px; }
        .search-result-level { color: var(--text-light); font-size: 14px; margin: 4px 0; }
        .search-result-intents { display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0; }
        .search-result-location { color: var(--text-light); font-size: 14px; margin: 4px 0; }
        .search-result-action { margin-top: 12px; }
      `}</style>
    </div>
  );
}
