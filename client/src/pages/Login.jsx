import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const { login, hydrateSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const redirectPath = searchParams.get('redirect') || '/matches';

    if (!token || !userParam) return;

    try {
      const parsedUser = JSON.parse(decodeURIComponent(userParam));
      hydrateSession(token, parsedUser);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Failed to hydrate auth session', err);
    }
  }, [hydrateSession, location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      const targetPath = ['admin', 'moderator', 'support'].includes(res.user?.role) ? '/admin' : '/matches';
      navigate(targetPath, { replace: true });
      toast.success('Welcome back!');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (!err.response) {
        toast.error('Cannot reach server. Is the backend running on port 5000?');
      } else if (err.response.status === 500) {
        toast.error(`Server error: ${msg || 'unknown'}. Is MongoDB running?`);
      } else {
        toast.error(msg || 'Login failed');
      }
      console.error('Login error:', err.response?.status, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-transition">
      <div className="auth-card card">
        <div className="auth-badge">Secure access</div>
        <h1>Welcome back to HeartSync </h1>
        <p className="auth-subtitle">Sign in to continue building meaningful connections in a trusted community.</p>
        <div className="demo-pill">Demo user: sarah@example.com / password123</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: 8 }}
          disabled={checking}
          onClick={async () => {
            setChecking(true);
            try {
              const res = await api.get('/health');
              toast.success(`Server connected! (${res.data.status})`);
            } catch (e) {
              toast.error('Cannot reach backend at http://localhost:5000');
            }
            setChecking(false);
          }}
        >
          {checking ? 'Checking...' : 'Check Backend Connection'}
        </button>

        <ul className="auth-highlights">
          <li>Verified members</li>
          <li>Safe conversations</li>
          <li>Personalized recommendations</li>
        </ul>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
      <style>{`
        .auth-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 110px); padding: 24px 0; }
        .auth-card { width: 100%; max-width: 440px; padding: 36px; border: 1px solid rgba(74,108,247,0.12); }
        .auth-badge { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary); background: rgba(74,108,247,0.10); margin-bottom: 12px; }
        .auth-card h1 { font-size: 28px; margin-bottom: 6px; }
        .auth-subtitle { color: var(--text-light); margin-bottom: 12px; line-height: 1.6; }
        .demo-pill { margin-bottom: 18px; padding: 10px 12px; border-radius: 12px; background: rgba(16,185,129,0.08); color: #047857; font-size: 13px; font-weight: 600; }
        .auth-highlights { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 8px; color: var(--text-light); font-size: 14px; }
        .auth-highlights li { display: flex; align-items: center; gap: 8px; }
        .auth-highlights li::before { content: '•'; color: var(--primary); font-size: 18px; line-height: 1; }
        .auth-footer { text-align: center; margin-top: 16px; color: var(--text-light); }
        .auth-footer a { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
}
