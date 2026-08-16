import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'UI/UX Design', 'Product Management', 'Data Science', 'DevOps', 'Machine Learning', 'Graphic Design', 'Flutter', 'React Native', 'AWS', 'Docker', 'Figma', 'SEO', 'Content Writing', 'Digital Marketing', 'Project Management'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
const INTENT_OPTIONS = ['Hire', 'Be Hired', 'Collaborate', 'Mentor', 'Find Co-founder', 'Freelance', 'Learn', 'Network'];

const SEARCH_CATEGORIES = [
  { id: 'people', label: 'People', icon: 'M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'projects', label: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'ideas', label: 'Ideas', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'communities', label: 'Communities', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

function SearchIcon({ path, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

export default function Search() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('people');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    skills: [],
    experienceLevel: '',
    location: '',
    intent: '',
    verified: false,
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.query) params.query = filters.query;
      if (filters.skills.length > 0) params.skills = filters.skills.join(',');
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

  useEffect(() => { handleSearch(); }, []);

  const toggleSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
    }));
  };

  const activeFilterCount = [filters.skills.length > 0, filters.experienceLevel, filters.intent, filters.location, filters.verified].filter(Boolean).length;

  return (
    <div className="search-page page-transition">
      {/* Search Header */}
      <div className="search-header">
        <h1>Search</h1>
        <p className="text-secondary">Find professionals, projects, ideas, and communities</p>
      </div>

      {/* Search Bar */}
      <div className="card search-bar-card">
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              placeholder="Search by name, skill, role, or keyword..."
              value={filters.query}
              onChange={e => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {filters.query && (
              <button className="search-clear" onClick={() => { setFilters(p => ({ ...p, query: '' })); setTimeout(handleSearch, 0); }}>✕</button>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            Filters {activeFilterCount > 0 && <span className="badge badge-primary" style={{ fontSize: 10, padding: '1px 6px' }}>{activeFilterCount}</span>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
        </div>

        {/* Category Tabs */}
        <div className="search-categories">
          {SEARCH_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`search-category ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <SearchIcon path={cat.icon} size={16} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="search-filters-panel">
            <div className="filter-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Experience Level</label>
                <select className="select" value={filters.experienceLevel} onChange={e => setFilters({ ...filters, experienceLevel: e.target.value })}>
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Intent</label>
                <select className="select" value={filters.intent} onChange={e => setFilters({ ...filters, intent: e.target.value })}>
                  <option value="">All Intents</option>
                  {INTENT_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Location</label>
                <input className="input" placeholder="City or country" value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
              </div>
            </div>
            <div className="filter-skills-section">
              <label className="text-sm font-medium text-secondary" style={{ marginBottom: 8, display: 'block' }}>Skills</label>
              <div className="filter-skills-grid">
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s}
                    className={`filter-skill ${filters.skills.includes(s) ? 'active' : ''}`}
                    onClick={() => toggleSkill(s)}
                  >
                    {filters.skills.includes(s) && <span>✓</span>}
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ query: filters.query, skills: [], experienceLevel: '', location: '', intent: '', verified: false }); }}>Clear Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="search-results">
        {loading ? (
          <div className="empty-state card">
            <div className="spinner" />
            <p style={{ marginTop: 12 }}>Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="results-grid">
            {results.map(prof => (
              <Link to={`/profile/${prof.id}`} key={prof.id} className="card result-card card-hover">
                <div className="result-header">
                  <div className="avatar avatar-lg">
                    {prof.photos?.[0]?.url ? <img src={prof.photos[0].url} alt="" /> : prof.name?.[0]}
                  </div>
                  {prof.isVerified && <span className="result-verified">✓</span>}
                </div>
                <div className="result-body">
                  <h4 className="result-name">{prof.name}</h4>
                  {prof.headline && <p className="result-headline">{prof.headline}</p>}
                  {prof.experienceLevel && <p className="result-level">{prof.experienceLevel}</p>}
                  {prof.location?.city && (
                    <p className="result-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {prof.location.city}
                    </p>
                  )}
                  <div className="skill-tags" style={{ marginTop: 8 }}>
                    {prof.skills?.slice(0, 4).map(s => <span key={s} className="tag-skill">{s}</span>)}
                    {prof.skills?.length > 4 && <span className="badge badge-neutral">+{prof.skills.length - 4}</span>}
                  </div>
                  {prof.intents?.length > 0 && (
                    <div className="result-intents" style={{ marginTop: 8 }}>
                      {prof.intents.slice(0, 3).map(i => <span key={i} className="badge badge-primary">{i}</span>)}
                    </div>
                  )}
                </div>
                <div className="result-footer">
                  <span className="btn btn-secondary btn-sm w-full">View Profile</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <style>{`
        .search-page { max-width: 1000px; margin: 0 auto; }
        .search-header { margin-bottom: var(--space-6); }
        .search-header h1 { font-size: var(--text-3xl); margin-bottom: var(--space-1); }

        .search-bar-card { padding: var(--space-5); margin-bottom: var(--space-5); }
        .search-bar-row { display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4); }
        .search-input-wrapper { flex: 1; position: relative; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); }
        .search-input {
          width: 100%; padding: 12px 40px 12px 42px;
          border: 2px solid var(--border); border-radius: var(--radius-lg);
          font-size: var(--text-md); color: var(--text); background: var(--bg-secondary);
          transition: all var(--transition-fast);
        }
        .search-input:focus { outline: none; border-color: var(--primary); background: var(--card); box-shadow: var(--shadow-ring); }
        .search-input::placeholder { color: var(--text-tertiary); }
        .search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-tertiary); font-size: 12px;
        }
        .search-clear:hover { background: var(--bg-secondary); color: var(--text); }

        .search-categories { display: flex; gap: var(--space-2); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border-light); }
        .search-category {
          display: flex; align-items: center; gap: var(--space-2);
          padding: 8px 16px; border-radius: var(--radius-full);
          font-size: var(--text-sm); font-weight: var(--weight-semibold);
          color: var(--text-secondary); background: var(--bg-secondary);
          transition: all var(--transition-fast);
        }
        .search-category:hover { background: var(--primary-light); color: var(--primary); }
        .search-category.active { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-border); }

        .search-filters-panel { padding-top: var(--space-4); margin-top: var(--space-4); border-top: 1px solid var(--border-light); }
        .filter-row { display: flex; gap: var(--space-4); }
        .filter-skills-section { margin-top: var(--space-4); }
        .filter-skills-grid { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .filter-skill {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: var(--radius-full);
          font-size: var(--text-xs); font-weight: var(--weight-semibold);
          color: var(--text-secondary); background: var(--bg-secondary);
          border: 1px solid transparent;
          transition: all var(--transition-fast);
        }
        .filter-skill:hover { border-color: var(--primary-border); color: var(--primary); }
        .filter-skill.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary-border); }
        .filter-actions { margin-top: var(--space-4); display: flex; justify-content: flex-end; }

        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4); }
        .result-card { display: flex; flex-direction: column; padding: var(--space-5); text-align: center; }
        .result-header { position: relative; margin-bottom: var(--space-3); display: flex; justify-content: center; }
        .result-verified {
          position: absolute; bottom: 2px; right: calc(50% - 42px);
          width: 22px; height: 22px; background: var(--primary); color: white;
          border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: bold; border: 2px solid var(--card);
        }
        .result-body { flex: 1; }
        .result-name { font-size: var(--text-md); margin-bottom: 2px; }
        .result-headline { color: var(--primary); font-size: var(--text-sm); font-weight: var(--weight-medium); }
        .result-level { color: var(--text-secondary); font-size: var(--text-xs); margin-top: 2px; }
        .result-location { display: flex; align-items: center; gap: 4px; justify-content: center; color: var(--text-tertiary); font-size: var(--text-xs); margin-top: 4px; }
        .result-intents { display: flex; gap: var(--space-1); justify-content: center; flex-wrap: wrap; }
        .result-footer { margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--border-light); }

        @media (max-width: 768px) {
          .filter-row { flex-direction: column; }
          .search-bar-row { flex-wrap: wrap; }
          .search-categories { overflow-x: auto; flex-wrap: nowrap; }
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
