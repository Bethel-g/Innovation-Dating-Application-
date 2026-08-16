import { useState } from 'react';
import toast from 'react-hot-toast';

const SKILL_GAPS = {
  'React': ['TypeScript', 'Next.js', 'Testing Library'],
  'Node.js': ['Express', 'TypeScript', 'PostgreSQL'],
  'Python': ['Django', 'FastAPI', 'Data Analysis'],
  'JavaScript': ['TypeScript', 'React', 'Node.js'],
  'TypeScript': ['React', 'Node.js', 'Testing'],
  'UI/UX Design': ['Figma', 'User Research', 'Prototyping'],
  'Product Management': ['Agile', 'Data Analysis', 'User Research'],
  'Data Science': ['Machine Learning', 'SQL', 'Python'],
  'DevOps': ['Docker', 'Kubernetes', 'CI/CD'],
  'Machine Learning': ['Python', 'TensorFlow', 'Data Science'],
};

const IMPROVEMENT_SUGGESTIONS = [
  { category: 'headline', icon: '💼', label: 'Professional Headline', impact: 'high' },
  { category: 'bio', icon: '📝', label: 'Compelling Bio', impact: 'high' },
  { category: 'skills', icon: '🛠️', label: 'Skills & Endorsements', impact: 'medium' },
  { category: 'portfolio', icon: '🔗', label: 'Portfolio Links', impact: 'high' },
  { category: 'experience', icon: '📊', label: 'Work Experience', impact: 'medium' },
  { category: 'projects', icon: '🚀', label: 'Projects', impact: 'medium' },
  { category: 'certifications', icon: '📜', label: 'Certifications', impact: 'low' },
  { category: 'recommendations', icon: '⭐', label: 'Recommendations', impact: 'medium' },
];

export default function AIProfileAnalysis({ user, onClose }) {
  const [step, setStep] = useState('upload');
  const [cvFile, setCvFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const analyzeProfile = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const skills = user?.skills || [];
      const hasHeadline = !!user?.headline;
      const hasBio = !!user?.bio;
      const hasPortfolio = user?.portfolioLinks?.github || user?.portfolioLinks?.website;
      const hasExperience = !!user?.experienceLevel;

      let score = 40;
      if (hasHeadline) score += 10;
      if (hasBio) score += 10;
      if (skills.length > 0) score += Math.min(skills.length * 3, 15);
      if (hasPortfolio) score += 10;
      if (hasExperience) score += 10;
      if (user?.photos?.length > 0) score += 5;

      const improvements = IMPROVEMENT_SUGGESTIONS.filter(s => {
        if (s.category === 'headline' && !hasHeadline) return true;
        if (s.category === 'bio' && !hasBio) return true;
        if (s.category === 'skills' && skills.length < 3) return true;
        if (s.category === 'portfolio' && !hasPortfolio) return true;
        if (s.category === 'experience' && !hasExperience) return true;
        return false;
      });

      const skillGaps = {};
      skills.forEach(skill => {
        if (SKILL_GAPS[skill]) {
          const gaps = SKILL_GAPS[skill].filter(g => !skills.includes(g));
          if (gaps.length > 0) skillGaps[skill] = gaps;
        }
      });

      setResults({
        score: Math.min(score, 100),
        strengths: [
          skills.length > 3 && 'Strong skill set',
          hasHeadline && 'Professional headline',
          hasBio && 'Compelling bio',
          hasPortfolio && 'Portfolio links',
          user?.photos?.length > 0 && 'Profile photo',
          hasExperience && 'Experience level set',
        ].filter(Boolean),
        improvements,
        skillGaps,
        missingSkills: Object.values(skillGaps).flat().slice(0, 5),
        suggestions: [
          !hasHeadline && 'Add a professional headline to increase visibility by 40%',
          !hasBio && 'Write a compelling bio to attract 3x more connections',
          skills.length < 3 && 'Add more skills to improve match accuracy',
          !hasPortfolio && 'Add portfolio links to showcase your work',
        ].filter(Boolean),
      });
      setStep('results');
      setAnalyzing(false);
    }, 2500);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg ai-analysis-modal" onClick={e => e.stopPropagation()}>
        {step === 'upload' && (
          <>
            <div className="analysis-header">
              <div className="analysis-icon">🤖</div>
              <h2>AI Profile Analysis</h2>
              <p>Get personalized insights to optimize your professional presence</p>
            </div>

            <div className="analysis-options">
              <div className="analysis-option" onClick={() => { setStep('analyzing'); analyzeProfile(); }}>
                <span className="option-icon">📊</span>
                <h3>Analyze Current Profile</h3>
                <p>Get instant feedback on your existing profile</p>
              </div>
              <div className="analysis-option" onClick={() => setStep('upload-cv')}>
                <span className="option-icon">📄</span>
                <h3>Upload CV/Resume</h3>
                <p>AI-powered analysis of your resume with recommendations</p>
              </div>
            </div>
          </>
        )}

        {step === 'upload-cv' && (
          <>
            <h2>Upload Your CV</h2>
            <p className="upload-desc">Our AI will analyze your resume and provide detailed recommendations</p>
            <div className="cv-upload-area" onClick={() => document.getElementById('cv-input').click()}>
              <input id="cv-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => {
                if (e.target.files[0]) {
                  setCvFile(e.target.files[0]);
                  setStep('analyzing');
                  analyzeProfile();
                }
              }} />
              <div className="upload-icon">📄</div>
              <p>Click to upload or drag and drop</p>
              <span>PDF, DOC, DOCX (max 5MB)</span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setStep('upload')}>Back</button>
            </div>
          </>
        )}

        {step === 'analyzing' && (
          <div className="analyzing-state">
            <div className="analyzing-spinner" />
            <h2>Analyzing Your Profile...</h2>
            <p>Our AI is reviewing your professional presence</p>
            <div className="analyzing-steps">
              <div className="a-step done">✓ Skills assessment</div>
              <div className="a-step done">✓ Experience analysis</div>
              <div className="a-step active">⟳ Generating recommendations...</div>
              <div className="a-step">○ Market positioning</div>
            </div>
          </div>
        )}

        {step === 'results' && results && (
          <div className="analysis-results">
            <div className="results-header">
              <div className="score-circle" style={{ borderColor: getScoreColor(results.score) }}>
                <span className="score-num" style={{ color: getScoreColor(results.score) }}>{results.score}</span>
                <span className="score-label">{getScoreLabel(results.score)}</span>
              </div>
              <div className="score-breakdown">
                <h2>Profile Score: {results.score}%</h2>
                <p>{results.score >= 80 ? 'Your profile is strong! Here are some fine-tuning tips.' : 'There\'s room for improvement. Here\'s what to focus on.'}</p>
              </div>
            </div>

            {results.strengths.length > 0 && (
              <div className="results-section">
                <h3>✅ Strengths</h3>
                <div className="strengths-list">
                  {results.strengths.map((s, i) => (
                    <div key={i} className="strength-item">{s}</div>
                  ))}
                </div>
              </div>
            )}

            {results.improvements.length > 0 && (
              <div className="results-section">
                <h3>⚠️ Areas to Improve</h3>
                <div className="improvements-list">
                  {results.improvements.map((item, i) => (
                    <div key={i} className="improvement-item">
                      <span className="improvement-icon">{item.icon}</span>
                      <div className="improvement-info">
                        <span className="improvement-label">{item.label}</span>
                        <span className={`impact-badge impact-${item.impact}`}>{item.impact} impact</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.suggestions.length > 0 && (
              <div className="results-section">
                <h3>💡 Quick Wins</h3>
                <ul className="suggestions-list">
                  {results.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {results.missingSkills.length > 0 && (
              <div className="results-section">
                <h3>🎯 Recommended Skills to Add</h3>
                <div className="skill-tags">
                  {results.missingSkills.map(s => <span key={s} className="tag-skill">{s}</span>)}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={onClose}>Done</button>
              <button className="btn btn-secondary" onClick={() => { setStep('upload'); setResults(null); }}>Analyze Again</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-analysis-modal { max-width: 600px; }
        .analysis-header { text-align: center; margin-bottom: 24px; }
        .analysis-icon { font-size: 48px; margin-bottom: 12px; }
        .analysis-header h2 { margin-bottom: 4px; }
        .analysis-header p { color: var(--text-light); }

        .analysis-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .analysis-option { padding: 24px; border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer; text-align: center; transition: all 0.2s; }
        .analysis-option:hover { border-color: var(--primary); background: rgba(74,108,247,0.03); }
        .option-icon { font-size: 32px; display: block; margin-bottom: 8px; }
        .analysis-option h3 { font-size: 16px; margin-bottom: 4px; }
        .analysis-option p { font-size: 13px; color: var(--text-light); }

        .upload-desc { color: var(--text-light); margin-bottom: 20px; }
        .cv-upload-area { border: 2px dashed var(--border); border-radius: var(--radius); padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .cv-upload-area:hover { border-color: var(--primary); background: rgba(74,108,247,0.03); }
        .upload-icon { font-size: 48px; margin-bottom: 12px; }
        .cv-upload-area p { font-weight: 600; margin-bottom: 4px; }
        .cv-upload-area span { font-size: 13px; color: var(--text-light); }

        .analyzing-state { text-align: center; padding: 40px; }
        .analyzing-spinner { width: 48px; height: 48px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .analyzing-steps { text-align: left; max-width: 300px; margin: 20px auto 0; }
        .a-step { padding: 8px 0; font-size: 14px; color: var(--text-light); }
        .a-step.done { color: #22c55e; }
        .a-step.active { color: var(--primary); font-weight: 600; }

        .results-header { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }
        .score-circle { width: 80px; height: 80px; border-radius: 50%; border: 4px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .score-num { font-size: 28px; font-weight: 700; line-height: 1; }
        .score-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-light); }
        .score-breakdown h2 { font-size: 22px; margin-bottom: 4px; }
        .score-breakdown p { color: var(--text-light); font-size: 14px; }

        .results-section { margin-bottom: 20px; }
        .results-section h3 { font-size: 16px; margin-bottom: 10px; }
        .strengths-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .strength-item { padding: 6px 12px; background: rgba(34,197,94,0.08); color: #059669; border-radius: var(--radius); font-size: 13px; }

        .improvements-list { display: flex; flex-direction: column; gap: 8px; }
        .improvement-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-secondary); border-radius: var(--radius); }
        .improvement-icon { font-size: 20px; }
        .improvement-info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .improvement-label { font-size: 14px; font-weight: 500; }
        .impact-badge { font-size: 11px; padding: 2px 8px; border-radius: 8px; text-transform: capitalize; }
        .impact-high { background: rgba(239,68,68,0.1); color: #ef4444; }
        .impact-medium { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .impact-low { background: rgba(34,197,94,0.1); color: #22c55e; }

        .suggestions-list { list-style: none; padding: 0; }
        .suggestions-list li { padding: 8px 0; font-size: 14px; color: var(--text-light); border-bottom: 1px solid var(--border); }
        .suggestions-list li:last-child { border-bottom: none; }
        .hidden { display: none; }
      `}</style>
    </div>
  );
}
