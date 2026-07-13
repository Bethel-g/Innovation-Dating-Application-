import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      const targetPath = ['admin', 'moderator', 'support'].includes(res.user?.role) ? '/admin' : '/matches';
      navigate(targetPath, { replace: true });
      toast.success('Account created! Welcome to Innovation Dating!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-transition">
      <div className="auth-card card">
        <div className="auth-badge">Join HeartSync</div>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Start your journey with a respectful, modern community designed for meaningful connections.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
      <style>{`
        .auth-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 110px); padding: 24px 0; }
        .auth-card { width: 100%; max-width: 440px; padding: 36px; border: 1px solid rgba(74,108,247,0.12); }
        .auth-badge { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--primary); background: rgba(74,108,247,0.10); margin-bottom: 12px; }
        .auth-card h1 { font-size: 28px; margin-bottom: 6px; }
        .auth-subtitle { color: var(--text-light); margin-bottom: 20px; line-height: 1.6; }
        .auth-footer { text-align: center; margin-top: 16px; color: var(--text-light); }
        .auth-footer a { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
}
