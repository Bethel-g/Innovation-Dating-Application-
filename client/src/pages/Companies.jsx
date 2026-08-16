import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SAMPLE_COMPANIES = [
  {
    id: 1, name: 'TechCorp Africa', industry: 'Technology', size: '500-1000', founded: 2018,
    location: 'Addis Ababa, Ethiopia', website: 'techcorpafrica.com',
    description: 'Leading African tech company building AI-powered solutions for healthcare, finance, and education across the continent.',
    followers: 12340, employees: 567, posts: 89,
    tags: ['AI', 'Healthcare', 'FinTech'], logo: 'T', isFollowing: false,
  },
  {
    id: 2, name: 'GreenTech Solutions', industry: 'Sustainability', size: '100-500', founded: 2020,
    location: 'Nairobi, Kenya', website: 'greentech.co.ke',
    description: 'Building sustainable technology solutions to combat climate change in Africa. Carbon tracking, renewable energy optimization.',
    followers: 8920, employees: 234, posts: 56,
    tags: ['Climate Tech', 'Clean Energy', 'Carbon Tracking'], logo: 'G', isFollowing: true,
  },
  {
    id: 3, name: 'HealthAI', industry: 'Healthcare', size: '200-500', founded: 2019,
    location: 'Lagos, Nigeria', website: 'healthai.ng',
    description: 'AI-powered diagnostics and healthcare management system serving rural communities across West Africa.',
    followers: 6780, employees: 189, posts: 45,
    tags: ['AI', 'Healthcare', 'Diagnostics'], logo: 'H', isFollowing: false,
  },
  {
    id: 4, name: 'EduTech Africa', industry: 'Education', size: '50-200', founded: 2021,
    location: 'Addis Ababa, Ethiopia', website: 'edutech.africa',
    description: 'Making quality education accessible to millions of African students through technology.',
    followers: 5430, employees: 87, posts: 34,
    tags: ['EdTech', 'E-Learning', 'STEM'], logo: 'E', isFollowing: false,
  },
  {
    id: 5, name: 'CloudAfrica', industry: 'Cloud Infrastructure', size: '100-500', founded: 2017,
    location: 'Lagos, Nigeria', website: 'cloudafrica.io',
    description: 'Pan-African cloud infrastructure provider powering the next generation of African tech companies.',
    followers: 15600, employees: 345, posts: 112,
    tags: ['Cloud', 'Infrastructure', 'DevOps'], logo: 'C', isFollowing: true,
  },
];

function CompanyCard({ company, onFollow, onClick }) {
  return (
    <div className="company-card card" onClick={() => onClick(company)}>
      <div className="company-card-header">
        <div className="company-logo" style={{ background: `linear-gradient(135deg, ${stringToColor(company.name)}, ${stringToColor(company.industry)})` }}>
          {company.logo}
        </div>
        <div className="company-info">
          <h3>{company.name}</h3>
          <p className="company-industry">{company.industry} · {company.size} employees</p>
        </div>
      </div>
      <p className="company-desc">{company.description.substring(0, 120)}...</p>
      <div className="company-tags">
        {company.tags.map(tag => <span key={tag} className="tag-skill tag-xs">{tag}</span>)}
      </div>
      <div className="company-stats-row">
        <span>👥 {formatNum(company.followers)} followers</span>
        <span>🏢 {company.employees} employees</span>
        <span>📝 {company.posts} posts</span>
      </div>
      <div className="company-card-footer">
        <span className="company-location">📍 {company.location}</span>
        <button
          className={`btn ${company.isFollowing ? 'btn-outline' : 'btn-primary'} btn-sm`}
          onClick={(e) => { e.stopPropagation(); onFollow(company.id); }}
        >
          {company.isFollowing ? 'Following ✓' : 'Follow'}
        </button>
      </div>
    </div>
  );
}

function CompanyDetail({ company, onClose, onFollow }) {
  const [activeTab, setActiveTab] = useState('about');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="company-detail-header">
          <div className="company-logo lg" style={{ background: `linear-gradient(135deg, ${stringToColor(company.name)}, ${stringToColor(company.industry)})` }}>
            {company.logo}
          </div>
          <div className="company-detail-info">
            <h2>{company.name}</h2>
            <p>{company.industry} · {company.location} · {company.size} employees</p>
            <div className="company-detail-stats">
              <span>👥 {formatNum(company.followers)} followers</span>
              <span>🏢 {company.employees} employees</span>
              <span>📝 {company.posts} posts</span>
            </div>
          </div>
          <button
            className={`btn ${company.isFollowing ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => onFollow(company.id)}
          >
            {company.isFollowing ? 'Following ✓' : 'Follow'}
          </button>
        </div>

        <div className="company-tabs">
          {['about', 'jobs', 'employees', 'posts'].map(tab => (
            <button key={tab} className={`company-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="company-about">
            <h3>About</h3>
            <p>{company.description}</p>
            <h3>Industry</h3>
            <p>{company.industry}</p>
            <h3>Founded</h3>
            <p>{company.founded}</p>
            <h3>Website</h3>
            <p>{company.website}</p>
            <h3>Specialties</h3>
            <div className="skill-tags">{company.tags.map(tag => <span key={tag} className="tag-skill">{tag}</span>)}</div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="company-jobs">
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-icon">💼</div>
              <h3>Open Positions</h3>
              <p>Check back later for job openings at {company.name}</p>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="company-employees">
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }}>
              {company.employees} employees work at {company.name}
            </p>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="company-posts">
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }}>
              {company.posts} posts published by {company.name}
            </p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 50%)`;
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

export default function Companies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState(SAMPLE_COMPANIES);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  const industries = ['all', ...new Set(companies.map(c => c.industry))];

  const toggleFollow = (companyId) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, isFollowing: !c.isFollowing, followers: c.isFollowing ? c.followers - 1 : c.followers + 1 } : c));
    toast.success('Updated!');
  };

  const filtered = companies
    .filter(c => filterIndustry === 'all' || c.industry === filterIndustry)
    .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.industry.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="companies-page page-transition">
      <div className="page-header">
        <h1>Companies</h1>
        <p>Discover organizations and follow their updates</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          <span className="tab-icon">🏢</span> Browse
        </button>
        <button className={`tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>
          <span className="tab-icon">❤️</span> Following ({companies.filter(c => c.isFollowing).length})
        </button>
      </div>

      {activeTab === 'browse' && (
        <>
          <div className="companies-toolbar">
            <div className="search-bar-companies">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search companies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind === 'all' ? 'All Industries' : ind}</option>
              ))}
            </select>
          </div>

          <div className="companies-grid">
            {filtered.map(company => (
              <CompanyCard key={company.id} company={company} onFollow={toggleFollow} onClick={setSelectedCompany} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No companies found</h3>
              <p>Try a different search or filter</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'following' && (
        <div className="companies-grid">
          {companies.filter(c => c.isFollowing).map(company => (
            <CompanyCard key={company.id} company={company} onFollow={toggleFollow} onClick={setSelectedCompany} />
          ))}
          {companies.filter(c => c.isFollowing).length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>Not following any companies yet</h3>
              <p>Browse and follow companies to see their updates here</p>
            </div>
          )}
        </div>
      )}

      {selectedCompany && (
        <CompanyDetail company={selectedCompany} onClose={() => setSelectedCompany(null)} onFollow={toggleFollow} />
      )}

      <style>{`
        .companies-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }
        .tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .tab:hover { background: rgba(74,108,247,0.05); }
        .tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .tab-icon { margin-right: 6px; }

        .companies-toolbar { display: flex; gap: 12px; margin-bottom: 20px; }
        .search-bar-companies { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
        .search-bar-companies input { flex: 1; border: none; background: transparent; font-size: 14px; outline: none; }
        .companies-toolbar select { padding: 10px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; }

        .companies-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .company-card { padding: 20px; cursor: pointer; transition: all 0.2s; }
        .company-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .company-card-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .company-logo { width: 48px; height: 48px; border-radius: var(--radius); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
        .company-logo.lg { width: 72px; height: 72px; font-size: 28px; }
        .company-info h3 { font-size: 17px; margin-bottom: 2px; }
        .company-industry { font-size: 13px; color: var(--text-light); }
        .company-desc { font-size: 14px; color: var(--text-light); line-height: 1.5; margin-bottom: 10px; }
        .company-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
        .tag-xs { font-size: 10px; padding: 2px 6px; }
        .company-stats-row { display: flex; gap: 16px; font-size: 13px; color: var(--text-light); margin-bottom: 12px; padding-top: 10px; border-top: 1px solid var(--border); }
        .company-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .company-location { font-size: 13px; color: var(--text-light); }

        .company-detail-header { display: flex; gap: 20px; align-items: center; margin-bottom: 20px; }
        .company-detail-info { flex: 1; }
        .company-detail-info h2 { margin-bottom: 4px; }
        .company-detail-info p { color: var(--text-light); font-size: 14px; }
        .company-detail-stats { display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: var(--text-light); }

        .company-tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
        .company-tab { padding: 10px 20px; font-weight: 600; background: transparent; color: var(--text-light); border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .company-tab:hover { color: var(--primary); }
        .company-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

        .company-about h3 { font-size: 16px; margin-bottom: 8px; margin-top: 16px; }
        .company-about h3:first-child { margin-top: 0; }
        .company-about p { font-size: 14px; color: var(--text-light); line-height: 1.6; }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-light); }

        @media (max-width: 768px) {
          .companies-grid { grid-template-columns: 1fr; }
          .company-detail-header { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
