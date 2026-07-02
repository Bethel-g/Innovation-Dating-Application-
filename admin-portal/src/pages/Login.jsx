export default function Login() {
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>Moved to Unified Portal</h1>
        <p>The admin panel is now integrated into the main app.</p>
        <p style={{ marginTop: 16 }}>
          Go to <strong>http://localhost:5173</strong> and sign in with:
        </p>
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, margin: '16px 0', fontSize: 14 }}>
          <strong>admin@example.com</strong><br />
          <strong>admin123</strong>
        </div>
        <p style={{ fontSize: 13, color: '#636e72' }}>
          After logging in, click <strong>"Admin Mode"</strong> in the navbar.
        </p>
        <a href="http://localhost:5173" className="btn btn-primary btn-lg" style={{ display: 'block', textAlign: 'center', marginTop: 20, textDecoration: 'none' }}>
          Go to Unified Portal
        </a>
      </div>
      <style>{`
        .admin-login { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #1a1a2e, #16213e); width: 100%; }
        .admin-login-card { background: #fff; padding: 40px; border-radius: 12px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; }
        .admin-login-card h1 { font-size: 24px; margin-bottom: 8px; background: linear-gradient(135deg, #e94057, #8a2387); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .admin-login-card p { color: #636e72; }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 8px; font-weight: 600; transition: all 0.2s; }
        .btn-primary { background: #e94057; color: #fff; }
        .btn-lg { padding: 14px 28px; font-size: 16px; }
      `}</style>
    </div>
  );
}
