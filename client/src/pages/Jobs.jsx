import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const EXPERIENCE = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
const CATEGORIES = ['Engineering', 'Design', 'Product', 'Data Science', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Legal'];

const SAMPLE_JOBS = [
  {
    id: 1, title: 'Senior AI Engineer', company: 'TechCorp Africa', location: 'Remote', type: 'Full-time',
    salary: '$120,000 - $150,000', posted: '2 days ago', applicants: 24,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
    description: 'Join our AI team to build cutting-edge machine learning solutions for healthcare across Africa.',
    requirements: ['5+ years ML experience', 'Strong Python skills', 'Experience with production ML systems'],
    benefits: ['Remote-first', 'Equity', 'Health insurance', 'Learning budget'],
    isSaved: false,
  },
  {
    id: 2, title: 'Full-Stack Developer', company: 'StartupX', location: 'Addis Ababa, Ethiopia', type: 'Full-time',
    salary: '$60,000 - $80,000', posted: '1 day ago', applicants: 18,
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    description: 'Build the next generation of fintech products serving millions across Africa.',
    requirements: ['3+ years full-stack', 'React & Node.js', 'Database design'],
    benefits: ['Equity', 'Flexible hours', 'Team retreats'],
    isSaved: true,
  },
  {
    id: 3, title: 'Product Designer', company: 'GreenTech Solutions', location: 'Nairobi, Kenya', type: 'Full-time',
    salary: '$70,000 - $90,000', posted: '3 days ago', applicants: 31,
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'Design Systems'],
    description: 'Design beautiful, intuitive products that help businesses reduce their carbon footprint.',
    requirements: ['4+ years product design', 'Strong portfolio', 'User research experience'],
    benefits: ['Mission-driven', 'Stock options', 'Remote flexibility'],
    isSaved: false,
  },
  {
    id: 4, title: 'Data Scientist', company: 'HealthAI', location: 'Remote', type: 'Contract',
    salary: '$90,000 - $120,000', posted: '5 days ago', applicants: 42,
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
    description: 'Analyze healthcare data to drive insights and improve patient outcomes across rural Africa.',
    requirements: ['MS in Data Science or related', '3+ years experience', 'Healthcare domain knowledge preferred'],
    benefits: ['High impact', 'Flexible schedule', 'Publication opportunities'],
    isSaved: false,
  },
  {
    id: 5, title: 'DevOps Engineer', company: 'CloudAfrica', location: 'Lagos, Nigeria', type: 'Full-time',
    salary: '$80,000 - $100,000', posted: '1 week ago', applicants: 15,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    description: 'Build and maintain cloud infrastructure serving millions of users across the continent.',
    requirements: ['4+ years DevOps', 'Cloud certifications preferred', 'Infrastructure as Code'],
    benefits: ['Growth opportunity', 'Certification budget', 'Relocation assistance'],
    isSaved: false,
  },
  {
    id: 6, title: 'Marketing Manager', company: 'EduTech Africa', location: 'Addis Ababa', type: 'Full-time',
    salary: '$40,000 - $55,000', posted: '4 days ago', applicants: 28,
    skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media'],
    description: 'Lead marketing efforts to bring quality education to millions of African students.',
    requirements: ['3+ years marketing', 'EdTech experience preferred', 'Data-driven mindset'],
    benefits: ['Impact-driven', 'Team events', 'Professional development'],
    isSaved: false,
  },
];

function ApplicationFlow({ job, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ coverLetter: '', experience: '', availability: 'immediately', salary: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setStep(3);
    toast.success('Application submitted!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h2>Apply to {job.title}</h2>
            <p className="apply-company">at {job.company}</p>
            <div className="apply-steps">
              <div className="apply-step active">1. Review</div>
              <div className="apply-step">2. Details</div>
              <div className="apply-step">3. Submit</div>
            </div>
            <div className="apply-review">
              <div className="apply-detail"><strong>Location:</strong> {job.location}</div>
              <div className="apply-detail"><strong>Type:</strong> {job.type}</div>
              <div className="apply-detail"><strong>Salary:</strong> {job.salary}</div>
              <div className="apply-detail"><strong>Skills:</strong></div>
              <div className="skill-tags">{job.skills.map(s => <span key={s} className="tag-skill">{s}</span>)}</div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setStep(2)}>Continue</button>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Your Application</h2>
            <div className="form-group">
              <label>Cover Letter</label>
              <textarea value={form.coverLetter} onChange={e => setForm({ ...form, coverLetter: e.target.value })} rows={5} placeholder="Why are you interested in this role?" />
            </div>
            <div className="form-group">
              <label>Relevant Experience</label>
              <textarea value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} rows={3} placeholder="Briefly describe your relevant experience" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Availability</label>
                <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
                  <option value="immediately">Immediately</option>
                  <option value="2weeks">2 weeks notice</option>
                  <option value="1month">1 month</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expected Salary</label>
                <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="e.g., $80,000" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="apply-success">
            <div className="success-icon">🎉</div>
            <h2>Application Submitted!</h2>
            <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been sent.</p>
            <p className="apply-next">The recruiter will review your application and get back to you within 5-7 business days.</p>
            <div className="apply-tracker">
              <div className="tracker-step done">
                <div className="tracker-dot" />
                <span>Applied</span>
              </div>
              <div className="tracker-line" />
              <div className="tracker-step current">
                <div className="tracker-dot" />
                <span>Review</span>
              </div>
              <div className="tracker-line" />
              <div className="tracker-step">
                <div className="tracker-dot" />
                <span>Interview</span>
              </div>
              <div className="tracker-line" />
              <div className="tracker-step">
                <div className="tracker-dot" />
                <span>Offer</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApply, setShowApply] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', category: 'all', experience: 'all', remote: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set(jobs.filter(j => j.isSaved).map(j => j.id)));

  const toggleSave = (jobId) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
    toast.success(savedJobs.has(jobId) ? 'Job unsaved' : 'Job saved!');
  };

  const filteredJobs = jobs
    .filter(j => filters.type === 'all' || j.type === filters.type)
    .filter(j => filters.experience === 'all' || true)
    .filter(j => !filters.remote || j.location.toLowerCase().includes('remote'))
    .filter(j => !searchQuery || j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="jobs-page page-transition">
      <div className="page-header">
        <h1>Job Marketplace</h1>
        <p>Find your next opportunity or post a position</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
          <span className="tab-icon">🔍</span> Browse Jobs
        </button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          <span className="tab-icon">🔖</span> Saved ({savedJobs.size})
        </button>
        <button className={`tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
          <span className="tab-icon">📋</span> My Applications
        </button>
        <button className={`tab ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
          <span className="tab-icon">➕</span> Post a Job
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="jobs-browse">
          <div className="jobs-toolbar">
            <div className="search-bar-jobs">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search jobs, companies, skills..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="filter-row">
              <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                <option value="all">All Types</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="remote-toggle">
                <input type="checkbox" checked={filters.remote} onChange={e => setFilters({ ...filters, remote: e.target.checked })} />
                <span>Remote Only</span>
              </label>
            </div>
          </div>

          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job.id} className={`job-card card ${selectedJob?.id === job.id ? 'selected' : ''}`} onClick={() => setSelectedJob(job)}>
                <div className="job-card-header">
                  <div className="job-company-logo">
                    {job.company[0]}
                  </div>
                  <div className="job-header-info">
                    <h3>{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <button className={`save-btn ${savedJobs.has(job.id) ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}>
                    {savedJobs.has(job.id) ? '🔖' : '🏷️'}
                  </button>
                </div>

                <div className="job-meta">
                  <span className="job-meta-item">📍 {job.location}</span>
                  <span className="job-meta-item">💼 {job.type}</span>
                  <span className="job-meta-item">💰 {job.salary}</span>
                  <span className="job-meta-item">📅 {job.posted}</span>
                </div>

                <p className="job-description">{job.description}</p>

                <div className="skill-tags">
                  {job.skills.map(s => <span key={s} className="tag-skill">{s}</span>)}
                </div>

                <div className="job-card-footer">
                  <span className="job-applicants">👥 {job.applicants} applicants</span>
                  <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setShowApply(job); }}>
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <h3>No jobs match your criteria</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="saved-section">
          <div className="jobs-grid">
            {jobs.filter(j => savedJobs.has(j.id)).map(job => (
              <div key={job.id} className="job-card card" onClick={() => setSelectedJob(job)}>
                <div className="job-card-header">
                  <div className="job-company-logo">{job.company[0]}</div>
                  <div className="job-header-info">
                    <h3>{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <button className="save-btn saved" onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}>🔖</button>
                </div>
                <div className="job-meta">
                  <span className="job-meta-item">📍 {job.location}</span>
                  <span className="job-meta-item">💼 {job.type}</span>
                </div>
                <div className="job-card-footer">
                  <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setShowApply(job); }}>Apply</button>
                </div>
              </div>
            ))}
          </div>
          {savedJobs.size === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <h3>No saved jobs</h3>
              <p>Save jobs you're interested in to view them later</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="applications-section">
          <div className="application-tracker card">
            <h3>Application Pipeline</h3>
            <div className="pipeline-stages">
              <div className="pipeline-stage">
                <span className="pipeline-count">2</span>
                <span className="pipeline-label">Applied</span>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-stage active">
                <span className="pipeline-count">1</span>
                <span className="pipeline-label">Review</span>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-stage">
                <span className="pipeline-count">0</span>
                <span className="pipeline-label">Interview</span>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-stage">
                <span className="pipeline-count">0</span>
                <span className="pipeline-label">Offer</span>
              </div>
            </div>
          </div>
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Your applications will appear here</h3>
            <p>Apply to jobs to track your progress</p>
          </div>
        </div>
      )}

      {activeTab === 'post' && (
        <div className="post-job-section">
          <div className="card post-job-card">
            <h2>Post a Job</h2>
            <p className="post-job-desc">Reach thousands of talented professionals across Africa</p>
            <div className="form-group">
              <label>Job Title</label>
              <input placeholder="e.g., Senior React Developer" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input placeholder="Your company name" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input placeholder="e.g., Remote, Addis Ababa" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Job Type</label>
                <select>{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select>
              </div>
              <div className="form-group">
                <label>Salary Range</label>
                <input placeholder="e.g., $60,000 - $80,000" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={5} placeholder="Describe the role, responsibilities, and what you're looking for..." />
            </div>
            <div className="form-group">
              <label>Required Skills</label>
              <input placeholder="e.g., React, Node.js, PostgreSQL (comma separated)" />
            </div>
            <button className="btn btn-primary">Post Job — $49</button>
          </div>
        </div>
      )}

      {selectedJob && !showApply && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="job-detail-header">
              <div className="job-company-logo lg">{selectedJob.company[0]}</div>
              <div>
                <h2>{selectedJob.title}</h2>
                <p className="job-company-lg">{selectedJob.company} · {selectedJob.location}</p>
              </div>
            </div>
            <div className="job-detail-meta">
              <span>💼 {selectedJob.type}</span>
              <span>💰 {selectedJob.salary}</span>
              <span>📅 {selectedJob.posted}</span>
              <span>👥 {selectedJob.applicants} applicants</span>
            </div>
            <h3>About the Role</h3>
            <p>{selectedJob.description}</p>
            <h3>Requirements</h3>
            <ul>{selectedJob.requirements?.map((r, i) => <li key={i}>{r}</li>)}</ul>
            <h3>Skills</h3>
            <div className="skill-tags">{selectedJob.skills.map(s => <span key={s} className="tag-skill">{s}</span>)}</div>
            <h3>Benefits</h3>
            <div className="benefits-list">{selectedJob.benefits?.map((b, i) => <span key={i} className="benefit-tag">✓ {b}</span>)}</div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { setSelectedJob(null); setShowApply(selectedJob); }}>Apply Now</button>
              <button className="btn btn-outline" onClick={() => toggleSave(selectedJob.id)}>
                {savedJobs.has(selectedJob.id) ? '🔖 Saved' : '🏷️ Save'}
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showApply && <ApplicationFlow job={showApply} onClose={() => setShowApply(null)} />}

      <style>{`
        .jobs-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 28px; }
        .page-header p { color: var(--text-light); font-size: 15px; }
        .tabs { display: flex; gap: 0; margin-bottom: 24px; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
        .tab { flex: 1; padding: 14px; font-weight: 600; background: transparent; color: var(--text-light); border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .tab:hover { background: rgba(74,108,247,0.05); }
        .tab.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; }
        .tab-icon { margin-right: 6px; }

        .jobs-toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .search-bar-jobs { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
        .search-bar-jobs input { flex: 1; border: none; background: transparent; font-size: 14px; outline: none; }
        .filter-row { display: flex; gap: 12px; align-items: center; }
        .filter-row select { padding: 8px 12px; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; }
        .remote-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
        .remote-toggle input { accent-color: var(--primary); }

        .jobs-grid { display: flex; flex-direction: column; gap: 12px; }
        .job-card { padding: 20px; cursor: pointer; transition: all 0.2s; border-left: 4px solid transparent; }
        .job-card:hover { border-left-color: var(--primary); box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .job-card.selected { border-left-color: var(--primary); background: rgba(74,108,247,0.03); }

        .job-card-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .job-company-logo { width: 48px; height: 48px; border-radius: var(--radius); background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
        .job-company-logo.lg { width: 64px; height: 64px; font-size: 28px; }
        .job-header-info { flex: 1; }
        .job-header-info h3 { font-size: 18px; margin-bottom: 2px; }
        .job-company { color: var(--primary); font-size: 14px; font-weight: 500; }
        .save-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; transition: transform 0.2s; }
        .save-btn:hover { transform: scale(1.2); }

        .job-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
        .job-meta-item { font-size: 13px; color: var(--text-light); }

        .job-description { font-size: 14px; color: var(--text-light); line-height: 1.5; margin-bottom: 12px; }
        .job-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
        .job-applicants { font-size: 13px; color: var(--text-light); }

        .apply-company { color: var(--primary); font-size: 14px; margin-bottom: 16px; }
        .apply-steps { display: flex; gap: 0; margin-bottom: 20px; }
        .apply-step { flex: 1; text-align: center; padding: 8px; font-size: 13px; font-weight: 600; background: var(--bg-secondary); color: var(--text-light); }
        .apply-step:first-child { border-radius: var(--radius) 0 0 var(--radius); }
        .apply-step:last-child { border-radius: 0 var(--radius) var(--radius) 0; }
        .apply-step.active { background: var(--primary); color: #fff; }
        .apply-review { padding: 16px; background: var(--bg-secondary); border-radius: var(--radius); margin-bottom: 16px; }
        .apply-detail { font-size: 14px; margin-bottom: 8px; }
        .apply-success { text-align: center; padding: 20px; }
        .success-icon { font-size: 48px; margin-bottom: 12px; }
        .apply-next { color: var(--text-light); font-size: 14px; margin: 12px 0 24px; }
        .apply-tracker { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 24px; }
        .tracker-step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .tracker-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); }
        .tracker-step.done .tracker-dot { background: #22c55e; }
        .tracker-step.current .tracker-dot { background: var(--primary); box-shadow: 0 0 0 4px rgba(74,108,247,0.2); }
        .tracker-step span { font-size: 11px; color: var(--text-light); }
        .tracker-line { width: 40px; height: 2px; background: var(--border); margin-bottom: 16px; }

        .job-detail-header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
        .job-company-lg { color: var(--primary); font-size: 15px; }
        .job-detail-meta { display: flex; flex-wrap: wrap; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; font-size: 14px; color: var(--text-light); }
        .job-detail-meta span { display: flex; align-items: center; gap: 4px; }
        .job-detail-header h2 { margin-bottom: 4px; }
        .benefits-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .benefit-tag { font-size: 13px; padding: 6px 12px; background: rgba(34,197,94,0.08); color: #059669; border-radius: var(--radius); }

        .pipeline-stages { display: flex; align-items: center; justify-content: center; gap: 0; padding: 20px; }
        .pipeline-stage { text-align: center; padding: 12px 20px; background: var(--bg-secondary); border-radius: var(--radius); }
        .pipeline-stage.active { background: var(--primary); color: #fff; }
        .pipeline-count { display: block; font-size: 24px; font-weight: 700; }
        .pipeline-label { font-size: 12px; }
        .pipeline-arrow { font-size: 20px; color: var(--text-light); margin: 0 8px; }

        .post-job-card { max-width: 600px; margin: 0 auto; padding: 32px; }
        .post-job-desc { color: var(--text-light); margin-bottom: 24px; }

        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-light); }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
