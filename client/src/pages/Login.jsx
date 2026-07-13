import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
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
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue finding your match</p>
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

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
      <style>{`
        .auth-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 110px); }
        .auth-card { width: 100%; max-width: 420px; padding: 40px; }
        .auth-card h1 { font-size: 28px; margin-bottom: 4px; }
        .auth-subtitle { color: var(--text-light); margin-bottom: 24px; }
        .auth-footer { text-align: center; margin-top: 20px; color: var(--text-light); }
        .auth-footer a { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
}
