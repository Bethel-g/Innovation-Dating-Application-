import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing page-transition">
      <div className="landing-content">
        <div className="landing-text">
          <h1>Find Your Perfect Match</h1>
          <p className="landing-subtitle">
            HeartSync uses intelligent matchmaking to connect you with people who share your interests, values, and vibe.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
          <div className="landing-features">
            {[
              { icon: '🧠', title: 'AI Matching', desc: 'Smart compatibility scoring' },
              { icon: '💬', title: 'Real Chat', desc: 'Meaningful conversations' },
              { icon: '🛡️', title: 'Safe & Verified', desc: 'Secure community' },
            ].map(f => (
              <div key={f.title} className="landing-feature">
                <span className="feature-icon">{f.icon}</span>
                <div><strong>{f.title}</strong><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="landing-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-avatar" />
              <div>
                <strong>Sarah, 26</strong>
                <span className="hero-location">📍 San Francisco</span>
              </div>
            </div>
            <div className="hero-interests">
              <span className="tag">Photography</span>
              <span className="tag">Hiking</span>
              <span className="tag">Coffee</span>
            </div>
            <p className="hero-bio">Adventure seeker & coffee enthusiast. Looking for someone to explore the city with!</p>
            <div className="hero-score">
              <span className="badge badge-success">95% Match</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .landing { min-height: 100vh; display: flex; align-items: center; background: linear-gradient(135deg, #faf0ff 0%, #fff5f5 100%); }
        .landing-content { max-width: 1200px; margin: 0 auto; padding: 40px 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .landing-text h1 { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 16px; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .landing-subtitle { font-size: 18px; color: var(--text-light); margin-bottom: 32px; line-height: 1.6; }
        .landing-actions { display: flex; gap: 16px; margin-bottom: 48px; }
        .landing-features { display: flex; flex-direction: column; gap: 20px; }
        .landing-feature { display: flex; align-items: center; gap: 16px; }
        .feature-icon { font-size: 32px; }
        .landing-feature strong { display: block; font-size: 16px; }
        .landing-feature p { color: var(--text-light); font-size: 14px; }
        .hero-card { background: var(--card); border-radius: 20px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); max-width: 360px; margin: 0 auto; animation: float 3s ease-in-out infinite; }
        .hero-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); }
        .hero-location { display: block; font-size: 13px; color: var(--text-light); }
        .hero-interests { margin-bottom: 12px; }
        .hero-bio { font-size: 14px; color: var(--text-light); margin-bottom: 12px; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @media (max-width: 768px) {
          .landing-content { grid-template-columns: 1fr; text-align: center; }
          .landing-text h1 { font-size: 36px; }
          .landing-actions { justify-content: center; flex-direction: column; }
          .landing-features { align-items: center; }
          .landing-visual { display: none; }
        }
      `}</style>
    </div>
  );
}
