import { Link } from 'react-router-dom';

const SECTORS = [
  {
    icon: '💻', title: 'Technology',
    desc: 'Software engineers, AI/ML specialists, DevOps, data scientists, and tech innovators building the future.',
    color: '#EF4444',
    pros: ['Frontend Developer', 'Backend Engineer', 'AI/ML Engineer', 'Cloud Architect', 'DevOps Lead', 'Data Scientist'],
  },
  {
    icon: '⚕️', title: 'Health & MedTech',
    desc: 'Healthcare professionals, medical researchers, biotech engineers, and health innovators transforming lives.',
    color: '#F97316',
    pros: ['Medical Researcher', 'HealthTech Founder', 'Clinical Specialist', 'Bioinformatics', 'Public Health', 'Pharma R&D'],
  },
  {
    icon: '🚀', title: 'Every Field',
    desc: 'From finance to education, design to manufacturing — every professional deserves the right connection.',
    color: '#F43F5E',
    pros: ['Founder', 'Product Designer', 'Marketing Lead', 'Educator', 'Finance Pro', 'Creative Director'],
  },
];

const HERO_PROFILES = [
  {
    name: 'Dr. Sarah Chen', role: 'AI Research Scientist', sector: 'Tech',
    tags: ['Deep Learning', 'NLP', 'Python', 'TensorFlow'],
    match: '98%', bio: 'Developing AI models for early disease detection. Looking for medtech collaborators.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson', role: 'HealthTech Founder', sector: 'Health',
    tags: ['Digital Health', 'FDA Strategy', 'Clinical Trials', 'React'],
    match: '95%', bio: 'Building remote patient monitoring platform. Seeking senior full-stack dev co-founder.',
    avatar: 'MJ',
  },
  {
    name: 'Priya Patel', role: 'Full-Stack Developer', sector: 'Tech',
    tags: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    match: '92%', bio: '5+ years building scalable healthcare platforms. Open to contract & full-time roles.',
    avatar: 'PP',
  },
];

const STATS = [
  { num: '10,000+', label: 'Professionals' },
  { num: '25,000+', label: 'Skill Matches' },
  { num: '96%', label: 'Match Accuracy' },
  { num: '150+', label: 'Industries' },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="logo-icon">⟡</span>
            <span className="logo-text">Innovation Dating</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost-nav">Sign In</Link>
            <Link to="/register" className="btn btn-primary-nav">Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="hero-section-inner">
          <div className="hero-text">
            <div className="hero-badge">🚀 Where Professionals Find Their Perfect Match</div>
            <h1 className="hero-title">
              Connect with the<br />
              <span className="gradient-text">Right People</span><br />
              to Build the Future
            </h1>
            <p className="hero-subtitle">
              Innovation Dating matches you with professionals who have the exact skills, 
              expertise, and vision you need — whether you are building a startup, 
              researching a breakthrough, or growing your career.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg pulse-btn">Find Your Match Free</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </div>
            <div className="hero-rating">
              <span className="stars">★★★★★</span>
              <span className="rating-text"><strong>4.9</strong> average match rating from 2,500+ professionals</span>
            </div>
          </div>
          <div className="hero-cards">
            {HERO_PROFILES.map((p, i) => (
              <div key={i} className={`hero-profile-card ${i === 1 ? 'center' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="hpc-header">
                  <div className="hpc-avatar" style={{ background: i === 0 ? 'linear-gradient(135deg, #EF4444, #F97316)' : i === 1 ? 'linear-gradient(135deg, #F97316, #F43F5E)' : 'linear-gradient(135deg, #F43F5E, #EF4444)' }}>
                    {p.avatar}
                  </div>
                  <div className="hpc-info">
                    <strong>{p.name}</strong>
                    <span>{p.role}</span>
                  </div>
                  <div className="hpc-match">{p.match}</div>
                </div>
                <div className="hpc-tags">
                  {p.tags.map(t => <span key={t}>{t}</span>)}
                </div>
                <p className="hpc-bio">{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="sectors-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Who You'll Meet</span>
            <h2>Connect Across <span className="gradient-text">Every Industry</span></h2>
            <p>Whether you are in tech, healthcare, or any other field — find the collaborators who match your vision.</p>
          </div>
          <div className="sectors-grid">
            {SECTORS.map((s, i) => (
              <div key={i} className="sector-card">
                <div className="sector-icon" style={{ background: `${s.color}15` }}>{s.icon}</div>
                <h3 style={{ color: s.color }}>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="sector-pros">
                  {s.pros.map((pro, j) => (
                    <span key={j} className="sector-tag">{pro}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2>From Profile to <span className="gradient-text">Collaboration</span></h2>
          </div>
          <div className="how-grid">
            {[
              { step: '1', icon: '🎯', title: 'Build Your Profile', desc: 'Showcase your skills, experience, and what you are looking for. Our AI learns what makes you unique.' },
              { step: '2', icon: '🧠', title: 'Get Smart Matches', desc: 'Our algorithm finds professionals whose skills and goals complement yours — not just match them.' },
              { step: '3', icon: '🤝', title: 'Collaborate & Build', desc: 'Start conversations, join projects, book mentorship, or find your next co-founder.' },
            ].map((h, i) => (
              <div key={i} className="how-card">
                <div className="how-step">{h.step}</div>
                <span className="how-icon">{h.icon}</span>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Success Stories</span>
            <h2>Real People, <span className="gradient-text">Real Results</span></h2>
          </div>
          <div className="testimonials-grid">
            {[
              { quote: 'I found my co-founder in under a week. The matching algorithm understood exactly what I needed — AI expertise meets medtech experience. Game changer.', name: 'Dr. Elena Voss', role: 'CEO, NeuroVasc Health', avatar: 'EV' },
              { quote: 'Hired three engineers through Innovation Dating. Every match was pre-vetted by skills, not resumes. Saved us months of recruiting.', name: 'David Kim', role: 'CTO, FinFlow', avatar: 'DK' },
              { quote: 'The mentorship program connected me with a senior ML researcher from DeepMind. My career trajectory changed completely.', name: 'Aisha Patel', role: 'ML Engineer', avatar: 'AP' },
            ].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="test-avatar">{t.avatar}</div>
                  <div className="test-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="cta-content">
          <h2>Ready to Find <span className="gradient-text">Your People</span>?</h2>
          <p>Join thousands of professionals already using Innovation Dating to connect, collaborate, and build the future.</p>
          <Link to="/register" className="btn btn-primary btn-lg pulse-btn">Create Your Free Profile</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">⟡</span>
            <span className="logo-text">Innovation Dating</span>
            <p>Connect. Collaborate. Build.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              {['Features', 'Pricing', 'For Developers', 'For Researchers', 'For Founders'].map(l => <span key={l} className="footer-link">{l}</span>)}
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              {['Blog', 'Help Center', 'Community', 'API', 'Status'].map(l => <span key={l} className="footer-link">{l}</span>)}
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              {['About', 'Careers', 'Privacy', 'Terms', 'Contact'].map(l => <span key={l} className="footer-link">{l}</span>)}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Innovation Dating. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .landing { background: #0B0F1E; color: #E8EDF5; overflow-x: hidden; }

        /* Nav */
        .landing-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 16px 0; background: rgba(11,15,30,0.8); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .landing-nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
        .landing-logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { font-size: 28px; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; }
        .logo-text { font-size: 22px; font-weight: 800; }
        .landing-nav-links { display: flex; align-items: center; gap: 12px; }
        .btn-ghost-nav { background: transparent; color: #8899B4; padding: 8px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .btn-ghost-nav:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .btn-primary-nav { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff; padding: 8px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .btn-primary-nav:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(239,68,68,0.4); }

        /* Hero */
        .hero-section { min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; padding: 120px 24px 60px; }
        .hero-bg { position: absolute; inset: 0; overflow: hidden; }
        .hero-orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.25; }
        .orb-1 { width: 600px; height: 600px; background: var(--primary); top: -200px; right: -200px; animation: orbFloat 12s ease-in-out infinite; }
        .orb-2 { width: 500px; height: 500px; background: var(--secondary); bottom: -150px; left: -150px; animation: orbFloat 15s ease-in-out infinite reverse; }
        .orb-3 { width: 350px; height: 350px; background: var(--accent); top: 50%; left: 60%; opacity: 0.12; animation: orbFloat 10s ease-in-out infinite; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%); }
        @keyframes orbFloat { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(40px, -30px); } 66% { transform: translate(-20px, 20px); } }
        .hero-section-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 1; }
        .hero-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--primary); margin-bottom: 28px; }
        .hero-title { font-size: 60px; font-weight: 900; line-height: 1.08; margin-bottom: 24px; letter-spacing: -1.5px; }
        .gradient-text { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-subtitle { font-size: 18px; color: #8899B4; line-height: 1.7; margin-bottom: 36px; max-width: 520px; }
        .hero-actions { display: flex; gap: 16px; margin-bottom: 36px; }
        .pulse-btn { animation: pulseGlow 2s ease-in-out infinite; }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }
        .hero-rating { display: flex; align-items: center; gap: 12px; }
        .stars { color: #F59E0B; font-size: 18px; letter-spacing: 2px; }
        .rating-text { color: #5A6A85; font-size: 14px; }
        .rating-text strong { color: #E8EDF5; }

        /* Hero Profile Cards */
        .hero-cards { display: flex; flex-direction: column; gap: 16px; perspective: 1000px; }
        .hero-profile-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; animation: cardSlide 0.6s ease-out both; cursor: default; transition: all 0.3s; max-width: 400px; }
        .hero-profile-card:hover { transform: translateY(-4px) scale(1.02); border-color: rgba(239,68,68,0.3); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .hero-profile-card.center { margin-left: 40px; }
        @keyframes cardSlide { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .hpc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .hpc-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0; }
        .hpc-info { flex: 1; min-width: 0; }
        .hpc-info strong { display: block; font-size: 15px; }
        .hpc-info span { font-size: 12px; color: #8899B4; }
        .hpc-match { font-size: 16px; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hpc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .hpc-tags span { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; background: rgba(255,255,255,0.06); color: #aab6c5; }
        .hpc-bio { font-size: 13px; color: #8899B4; line-height: 1.5; }

        /* Stats Bar */
        .stats-bar { border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 40px 24px; }
        .stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .stat-item { text-align: center; }
        .stat-num { display: block; font-size: 40px; font-weight: 900; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { font-size: 14px; color: #5A6A85; font-weight: 500; margin-top: 4px; display: block; }

        /* Section Common */
        .section-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .section-header { text-align: center; margin-bottom: 56px; }
        .section-tag { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; background: rgba(239,68,68,0.1); color: var(--primary); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .section-header h2 { font-size: 40px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
        .section-header p { color: #8899B4; font-size: 18px; max-width: 600px; margin: 0 auto; line-height: 1.7; }

        /* Sectors */
        .sectors-section { padding: 100px 0; }
        .sectors-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .sector-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 36px; transition: all 0.3s; }
        .sector-card:hover { transform: translateY(-6px); border-color: rgba(239,68,68,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .sector-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
        .sector-card h3 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        .sector-card > p { color: #8899B4; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
        .sector-pros { display: flex; flex-wrap: wrap; gap: 6px; }
        .sector-tag { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; background: rgba(255,255,255,0.05); color: #aab6c5; }

        /* How It Works */
        .how-section { padding: 100px 0; background: rgba(255,255,255,0.02); }
        .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .how-card { text-align: center; padding: 40px 24px; position: relative; }
        .how-step { position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-size: 80px; font-weight: 900; color: rgba(239,68,68,0.06); line-height: 1; }
        .how-icon { font-size: 48px; display: block; margin-bottom: 20px; position: relative; }
        .how-card h3 { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        .how-card p { color: #8899B4; font-size: 15px; line-height: 1.7; max-width: 300px; margin: 0 auto; }

        /* Testimonials */
        .testimonials-section { padding: 100px 0; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .testimonial-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 32px; transition: all 0.3s; }
        .testimonial-card:hover { transform: translateY(-4px); border-color: rgba(239,68,68,0.2); }
        .testimonial-stars { color: #F59E0B; font-size: 16px; margin-bottom: 16px; letter-spacing: 2px; }
        .testimonial-quote { color: #aab6c5; font-size: 15px; line-height: 1.7; margin-bottom: 24px; font-style: italic; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .test-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0; }
        .test-info strong { display: block; font-size: 15px; }
        .test-info span { font-size: 13px; color: #5A6A85; }

        /* CTA */
        .cta-section { padding: 120px 24px; position: relative; overflow: hidden; text-align: center; }
        .cta-bg { position: absolute; inset: 0; overflow: hidden; }
        .cta-content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .cta-content h2 { font-size: 48px; font-weight: 800; margin-bottom: 20px; }
        .cta-content p { font-size: 18px; color: #8899B4; margin-bottom: 36px; line-height: 1.7; }

        /* Footer */
        .landing-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 60px 24px 0; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 3fr; gap: 60px; padding-bottom: 40px; }
        .footer-brand .logo-icon { font-size: 32px; }
        .footer-brand .logo-text { font-size: 20px; font-weight: 800; }
        .footer-brand p { color: #5A6A85; font-size: 14px; margin-top: 12px; }
        .footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .footer-col h4 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #5A6A85; margin-bottom: 16px; }
        .footer-link { display: block; color: #8899B4; font-size: 14px; padding: 4px 0; cursor: default; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding: 20px 24px; text-align: center; }
        .footer-bottom p { color: #5A6A85; font-size: 13px; }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-section-inner { grid-template-columns: 1fr; text-align: center; }
          .hero-subtitle { margin: 0 auto 36px; }
          .hero-actions { justify-content: center; }
          .hero-rating { justify-content: center; }
          .hero-cards { display: none; }
          .hero-title { font-size: 48px; }
          .section-header h2 { font-size: 32px; }
          .sectors-grid, .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        }
        @media (max-width: 768px) {
          .hero-section { padding: 100px 16px 40px; }
          .hero-title { font-size: 36px; }
          .hero-subtitle { font-size: 16px; }
          .hero-actions { flex-direction: column; align-items: center; }
          .sectors-grid, .testimonials-grid, .how-grid { grid-template-columns: 1fr; }
          .section-header h2 { font-size: 28px; }
          .sectors-section, .how-section, .testimonials-section { padding: 60px 0; }
          .cta-section { padding: 80px 16px; }
          .cta-content h2 { font-size: 32px; }
          .footer-inner { grid-template-columns: 1fr; gap: 40px; }
          .footer-links { grid-template-columns: 1fr 1fr; gap: 24px; }
          .stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
          .stat-num { font-size: 32px; }
          .hero-profile-card.center { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
