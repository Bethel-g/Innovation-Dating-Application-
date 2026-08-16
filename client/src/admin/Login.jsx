import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to Innovation Dating');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="brand-row">
          <div className="brand-mark">ID</div>
          <div>
            <div className="login-brand">Innovation Dating</div>
            <p className="login-subtitle">Admin — operations, moderation & growth</p>
          </div>
        </div>
        <div className="demo-pill">Demo admin: admin@innovationdating.com / admin123</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@innovationdating.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      <style>{`
        .admin-login { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f172a, #111827 55%, #1e3a8a); width: 100%; padding: 24px; }
        .admin-login-card { background: rgba(255,255,255,0.97); padding: 40px; border-radius: 20px; width: 100%; max-width: 430px; box-shadow: 0 24px 80px rgba(15,23,42,0.35); border: 1px solid rgba(148,163,184,0.25); }
        .brand-row { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
        .brand-mark { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #EF4444, #F97316); color: #fff; font-weight: 800; font-size: 18px; }
        .login-brand { font-size: 24px; font-weight: 700; margin-bottom: 2px; color: #0f172a; }
        .login-subtitle { color: #636e72; font-size: 14px; margin: 0; }
        .demo-pill { margin: 16px 0 20px; padding: 10px 12px; border-radius: 12px; background: rgba(16,185,129,0.08); color: #047857; font-size: 13px; font-weight: 600; }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 10px; font-weight: 600; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #EF4444, #F97316); color: #fff; border: none; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(74,108,247,0.25); }
        .btn-block { width: 100%; margin-top: 8px; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>
    </div>
  );
}
